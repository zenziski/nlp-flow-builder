import axios from 'axios';
import { Logger } from '@nestjs/common';
import { BaseNodeExecutor } from '../base-node.executor';
import { ExecutionResult, ValidationResult } from '../engine.types';

export type AiProvider = 'openai' | 'anthropic' | 'groq' | 'openrouter' | 'custom';

// Base URLs for known providers (OpenAI-compatible unless noted)
const PROVIDER_URLS: Record<Exclude<AiProvider, 'custom'>, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
};

const ANTHROPIC_VERSION = '2023-06-01';

export class AiNodeExecutor extends BaseNodeExecutor {
  private readonly logger = new Logger(AiNodeExecutor.name);

  async validate(): Promise<ValidationResult> {
    const data = this.ctx.currentNode.data as Record<string, unknown>;
    const errors: string[] = [];
    if (!data?.provider) errors.push('AiNode requires a provider');
    if (!data?.model) errors.push('AiNode requires a model');
    if (!data?.apiKey) errors.push('AiNode requires an API key');
    if (!data?.prompt) errors.push('AiNode requires a user prompt');
    if (!data?.saveResponseAs) errors.push('AiNode requires a variable to save the response');
    if (data?.provider === 'custom' && !data?.baseUrl) errors.push('AiNode requires a base URL for custom provider');
    return errors.length ? this.validationFail(errors) : this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const data = this.ctx.currentNode.data as Record<string, unknown>;

    const provider = data.provider as AiProvider;
    const model = this.resolveText(data.model as string);
    const apiKey = this.resolveText(data.apiKey as string);
    const systemPrompt = data.systemPrompt
      ? this.resolveText(data.systemPrompt as string)
      : '';
    const userPrompt = this.resolveText(data.prompt as string);
    const saveResponseAs = data.saveResponseAs as string;
    const temperature = data.temperature !== undefined ? Number(data.temperature) : 0.7;
    const maxTokens = data.maxTokens ? Number(data.maxTokens) : 1024;
    const customBaseUrl = data.baseUrl ? this.resolveText(data.baseUrl as string) : '';

    try {
      let responseText: string;

      if (provider === 'anthropic') {
        responseText = await this.callAnthropic(apiKey, model, systemPrompt, userPrompt, maxTokens, temperature);
      } else {
        const url = provider === 'custom' ? customBaseUrl : PROVIDER_URLS[provider];
        responseText = await this.callOpenAiCompatible(apiKey, url, model, systemPrompt, userPrompt, temperature, maxTokens);
      }

      this.logger.log(
        `[AI] provider=${provider} model=${model} → ${responseText.slice(0, 120)}`,
      );

      const variableUpdates: Record<string, unknown> = {
        [saveResponseAs]: responseText,
      };

      const nextNodeId = this.resolveEdge('success') ?? this.resolveEdge();
      return this.ok([], nextNodeId, { variableUpdates });
    } catch (err: any) {
      this.logger.warn(`[AI] provider=${provider} model=${model} → ERROR: ${err?.message}`);

      const errorMessage = this.extractErrorMessage(err);
      const variableUpdates: Record<string, unknown> = {
        [saveResponseAs]: '',
        [`${saveResponseAs}_error`]: errorMessage,
      };

      const nextNodeId = this.resolveEdge('error') ?? this.resolveEdge();
      return this.ok([], nextNodeId, { variableUpdates });
    }
  }

  // ── OpenAI-compatible (OpenAI, Groq, OpenRouter, custom) ─────────────────

  private async callOpenAiCompatible(
    apiKey: string,
    url: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number,
  ): Promise<string> {
    const messages: { role: string; content: string }[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userPrompt });

    const response = await axios.post(
      url,
      { model, messages, temperature, max_tokens: maxTokens },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      },
    );

    return response.data?.choices?.[0]?.message?.content ?? '';
  }

  // ── Anthropic Messages API ────────────────────────────────────────────────

  private async callAnthropic(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number,
    temperature: number,
  ): Promise<string> {
    const body: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'user', content: userPrompt }],
    };
    if (systemPrompt) body.system = systemPrompt;

    const response = await axios.post(
      PROVIDER_URLS.anthropic,
      body,
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      },
    );

    const block = response.data?.content?.[0];
    return block?.type === 'text' ? block.text : '';
  }

  // ── Error extraction ──────────────────────────────────────────────────────

  private extractErrorMessage(err: any): string {
    if (err?.response?.data?.error?.message) return err.response.data.error.message;
    if (err?.response?.data?.message) return err.response.data.message;
    return err?.message ?? 'Unknown error';
  }
}

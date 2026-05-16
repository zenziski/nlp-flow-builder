import axios from 'axios';
import { Logger } from '@nestjs/common';
import { BaseNodeExecutor } from '../base-node.executor';
import { ExecutionResult, ValidationResult } from '../engine.types';
import { resolveVariables } from '../../common/utils/variable-resolver.util';

interface ResponseMapping {
  path: string;
  saveAs: string;
}

export class ApiNodeExecutor extends BaseNodeExecutor {
  private readonly logger = new Logger(ApiNodeExecutor.name);
  async validate(): Promise<ValidationResult> {
    const data = this.ctx.currentNode.data as Record<string, unknown>;
    if (!data?.url) return this.validationFail(['ApiNode requires a URL']);
    if (!data?.method) return this.validationFail(['ApiNode requires an HTTP method']);
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const data = this.ctx.currentNode.data as Record<string, unknown>;
    const method = (data.method as string).toLowerCase();
    const url = this.resolveText(data.url as string);

    const headers: Record<string, string> = {};
    if (data.headers && typeof data.headers === 'object') {
      for (const [k, v] of Object.entries(data.headers as Record<string, string>)) {
        headers[resolveVariables(k, this.ctx.variables, this.ctx.context)] =
          resolveVariables(v, this.ctx.variables, this.ctx.context);
      }
    }

    let body: unknown;
    if (data.body) {
      const bodyStr = typeof data.body === 'string'
        ? this.resolveText(data.body)
        : JSON.stringify(data.body);
      try { body = JSON.parse(bodyStr); } catch { body = bodyStr; }
    }

    try {
      const response = await axios({ method, url, headers, data: body, timeout: 10000 });
      const responseData = response.data;

      this.logger.log(
        `[API] ${method.toUpperCase()} ${url} → ${response.status} | responseData: ${JSON.stringify(responseData).slice(0, 500)}`,
      );

      const mappings = (data.responseMapping as ResponseMapping[]) ?? [];
      const variableUpdates: Record<string, unknown> = {};
      for (const mapping of mappings) {
        const keys = mapping.path.split('.');
        const value = keys.reduce((acc: any, key: string) => {
          if (acc === undefined || acc === null) return undefined;
          if (Array.isArray(acc)) return acc[Number(key)] ?? acc[key];
          return acc[key];
        }, responseData);
        this.logger.log(`[API] mapping "${mapping.path}" → ${JSON.stringify(value)} → saved as "${mapping.saveAs}"`);
        if (mapping.saveAs) variableUpdates[mapping.saveAs] = value;
      }

      const nextNodeId = this.resolveEdge('success') ?? this.resolveEdge();
      return this.ok([], nextNodeId, { variableUpdates });
    } catch (err: any) {
      this.logger.warn(`[API] ${method.toUpperCase()} ${url} → ERROR: ${err?.message}`);
      const nextNodeId = this.resolveEdge('error') ?? this.resolveEdge();
      return this.ok([], nextNodeId, { variableUpdates: {} });
    }
  }
}

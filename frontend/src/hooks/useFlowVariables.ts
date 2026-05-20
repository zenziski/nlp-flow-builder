import { useMemo } from 'react';
import { useNodesStore } from '../stores/useNodesStore';
import { useVaultStore } from '../stores/useVaultStore';

export type VariableSource = 'flow' | 'vault' | 'system';

export interface FlowVariable {
  name: string;
  source: VariableSource;
  /** Human-readable hint shown in the popup */
  hint?: string;
}

/**
 * Collects every variable name that is available at runtime in the current
 * flow and vault, including a handful of well-known system variables.
 */
export function useFlowVariables(): FlowVariable[] {
  const nodes = useNodesStore((s) => s.nodes);
  const vaultEntries = useVaultStore((s) => s.entries);

  return useMemo(() => {
    const vars: FlowVariable[] = [];
    const seen = new Set<string>();

    const add = (name: string, source: VariableSource, hint?: string) => {
      if (!name || seen.has(name)) return;
      seen.add(name);
      vars.push({ name, source, hint });
    };

    // ── System variables ──────────────────────────────────────────────────
    add('user.input', 'system', 'Last message sent by the user');
    add('session.id', 'system', 'Unique identifier for this conversation');

    // ── Flow node variables ───────────────────────────────────────────────
    for (const node of nodes) {
      const d = node.data as Record<string, any>;
      const label = (d.label as string | undefined) ?? node.id;

      switch (node.type) {
        case 'inputNode':
          if (d.saveAs) add(d.saveAs, 'flow', `Input → ${label}`);
          break;

        case 'variableNode':
          if (d.key) add(d.key, 'flow', `Variable → ${label}`);
          break;

        case 'aiNode':
          if (d.saveResponseAs) {
            add(d.saveResponseAs, 'flow', `AI response → ${label}`);
            add(`${d.saveResponseAs}_error`, 'flow', `AI error → ${label}`);
          }
          break;

        case 'apiNode':
          if (Array.isArray(d.responseMapping)) {
            for (const m of d.responseMapping) {
              if (m.saveAs) add(m.saveAs, 'flow', `API → ${label}`);
            }
          }
          break;

        default:
          break;
      }
    }

    // ── Vault entries ─────────────────────────────────────────────────────
    for (const entry of vaultEntries) {
      add(
        `vault.${entry.key}`,
        'vault',
        entry.description || `Vault secret`,
      );
    }

    return vars;
  }, [nodes, vaultEntries]);
}

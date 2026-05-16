import { resolveVariables } from './variable-resolver.util';

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'regex'
  | 'greaterThan'
  | 'lowerThan'
  | 'exists'
  | 'notExists';

export interface Condition {
  left: string;
  operator: ConditionOperator;
  right?: unknown;
}

export function evaluateCondition(
  condition: Condition,
  variables: Record<string, unknown> = {},
  context: Record<string, unknown> = {},
): boolean {
  const left = resolveVariables(String(condition.left ?? ''), variables, context);
  const right =
    condition.right !== undefined && typeof condition.right === 'string'
      ? resolveVariables(condition.right, variables, context)
      : condition.right;

  switch (condition.operator) {
    case 'equals':
      return left == right;
    case 'notEquals':
      return left != right;
    case 'contains':
      return String(left).toLowerCase().includes(String(right).toLowerCase());
    case 'regex':
      try {
        return new RegExp(String(right)).test(String(left));
      } catch {
        return false;
      }
    case 'greaterThan':
      return Number(left) > Number(right);
    case 'lowerThan':
      return Number(left) < Number(right);
    case 'exists':
      return left !== undefined && left !== null && left !== '' && left !== 'undefined';
    case 'notExists':
      return left === undefined || left === null || left === '' || left === 'undefined';
    default:
      return false;
  }
}

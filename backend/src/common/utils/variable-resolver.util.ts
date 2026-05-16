function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  // Try the full path as a literal flat key first (e.g. key stored as "user.name")
  if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path];
  // Fall back to dot-notation traversal for actual nested objects
  return path.split('.').reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export function resolveVariables(
  template: string,
  variables: Record<string, unknown> = {},
  context: Record<string, unknown> = {},
): string {
  if (typeof template !== 'string') return String(template ?? '');
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path: string) => {
    const trimmed = path.trim();
    const scope = { ...variables, context };
    const value = getNestedValue(scope, trimmed);
    return value !== undefined && value !== null ? String(value) : `{{${path}}}`;
  });
}

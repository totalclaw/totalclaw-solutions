type AnyRecord = Record<string, any>;

function isRecord(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function workflowRunId(value: unknown): string {
  if (!isRecord(value)) return '';
  return String(value.runId || value.run_id || value.id || value.executionId || '');
}

export function workflowOutput(value: unknown, preferredKeys: string[] = []): string {
  const seen = new Set<unknown>();
  const visit = (current: unknown, depth: number): string => {
    if (typeof current === 'string') return current.trim();
    if (!isRecord(current) || depth > 6 || seen.has(current)) return '';
    seen.add(current);
    const containers = [
      ...preferredKeys,
      'reviewed_package',
      'reviewedPackage',
      'reviewed_plan',
      'reviewedPlan',
      'reviewed_service_plan',
      'reviewedServicePlan',
      'reviewed_lesson',
      'reviewedLesson',
      'finalOutput',
      'output',
      'content',
      'text',
      'result',
    ];
    for (const key of containers) {
      const candidate = current[key];
      const text = visit(candidate, depth + 1);
      if (text) return text;
    }
    for (const key of ['vars', 'bindings', 'state', 'data']) {
      const text = visit(current[key], depth + 1);
      if (text) return text;
    }
    return '';
  };
  const result = visit(value, 0);
  return result || JSON.stringify(value, null, 2);
}

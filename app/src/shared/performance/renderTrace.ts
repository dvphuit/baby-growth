const counters = new Map<string, number>();

export function traceRender(name: string): void {
  if (!import.meta.env.DEV) return;

  const next = (counters.get(name) ?? 0) + 1;
  counters.set(name, next);

  if (typeof console !== 'undefined' && next % 10 === 0) {
    console.debug(`[render-trace] ${name}: ${next}`);
  }
}

export function getRenderCounts(): Record<string, number> {
  return Object.fromEntries(counters.entries());
}

export function resetRenderCounts(): void {
  counters.clear();
}

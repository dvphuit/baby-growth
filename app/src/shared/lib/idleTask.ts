export interface IdleTaskOptions {
  timeoutMs?: number;
  fallbackDelayMs?: number;
}

export function scheduleIdleTask(
  task: () => void,
  { timeoutMs = 2_000, fallbackDelayMs = 0 }: IdleTaskOptions = {},
): () => void {
  let settled = false;
  const run = () => {
    if (settled) return;
    settled = true;
    task();
  };

  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(run, { timeout: timeoutMs });
    return () => {
      if (settled) return;
      settled = true;
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
    };
  }

  const timeoutId = window.setTimeout(run, fallbackDelayMs);
  return () => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timeoutId);
  };
}

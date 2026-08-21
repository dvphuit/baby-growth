import { afterEach, describe, expect, it, vi } from 'vitest';
import { scheduleIdleTask } from './idleTask';

describe('scheduleIdleTask', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('waits for an idle callback before running work', () => {
    const task = vi.fn();
    const idleCallbacks: IdleRequestCallback[] = [];
    const cancelIdle = vi.fn();
    vi.stubGlobal('requestIdleCallback', vi.fn((callback: IdleRequestCallback) => {
      idleCallbacks.push(callback);
      return 17;
    }));
    vi.stubGlobal('cancelIdleCallback', cancelIdle);

    const cancel = scheduleIdleTask(task, { timeoutMs: 2000 });
    expect(task).not.toHaveBeenCalled();

    idleCallbacks[0]?.({
      didTimeout: false,
      timeRemaining: () => 10,
    });
    expect(task).toHaveBeenCalledTimes(1);

    cancel();
    expect(cancelIdle).not.toHaveBeenCalled();
  });

  it('cancels queued idle work before it starts', () => {
    const task = vi.fn();
    const idleCallbacks: IdleRequestCallback[] = [];
    const cancelIdle = vi.fn();
    vi.stubGlobal('requestIdleCallback', vi.fn((callback: IdleRequestCallback) => {
      idleCallbacks.push(callback);
      return 17;
    }));
    vi.stubGlobal('cancelIdleCallback', cancelIdle);

    const cancel = scheduleIdleTask(task);
    cancel();
    idleCallbacks[0]?.({
      didTimeout: false,
      timeRemaining: () => 10,
    });

    expect(cancelIdle).toHaveBeenCalledWith(17);
    expect(task).not.toHaveBeenCalled();
  });

  it('uses a bounded timer fallback when idle callbacks are unavailable', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestIdleCallback', undefined);
    vi.stubGlobal('cancelIdleCallback', undefined);
    const task = vi.fn();

    scheduleIdleTask(task, { fallbackDelayMs: 25 });
    vi.advanceTimersByTime(24);
    expect(task).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(task).toHaveBeenCalledTimes(1);
  });
});

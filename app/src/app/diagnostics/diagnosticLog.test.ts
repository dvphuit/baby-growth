import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearDiagnosticLogs,
  formatDiagnosticLogs,
  getDiagnosticLogs,
  logDiagnostic,
  subscribeDiagnosticLogs,
} from '@/app/diagnostics/diagnosticLog';

describe('diagnosticLog', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stores structured logs and redacts secrets', () => {
    logDiagnostic('drive', 'error', 'Request failed', {
      authorization: 'Bearer secret-token',
      message: 'access_token=hidden-value',
    });

    const [entry] = getDiagnosticLogs();
    expect(entry).toMatchObject({ scope: 'drive', level: 'error', message: 'Request failed' });
    expect(formatDiagnosticLogs()).not.toContain('secret-token');
    expect(formatDiagnosticLogs()).not.toContain('hidden-value');
  });

  it('notifies viewers when logs change or are cleared', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeDiagnosticLogs(listener);
    logDiagnostic('app', 'info', 'started');
    clearDiagnosticLogs();

    expect(listener).toHaveBeenLastCalledWith([]);
    unsubscribe();
  });
});

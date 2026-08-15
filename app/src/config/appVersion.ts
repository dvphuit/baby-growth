const FALLBACK_VERSION = '1.0.0';

function readEnv(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized || fallback;
}

export const APP_VERSION = readEnv(import.meta.env.VITE_APP_VERSION, FALLBACK_VERSION);
export const APP_BUILD_SHA = readEnv(import.meta.env.VITE_BUILD_SHA, 'local');
export const APP_BUILD_REF = readEnv(import.meta.env.VITE_BUILD_REF, 'local');
export const APP_BUILD_TIME = import.meta.env.VITE_BUILD_TIME?.trim() || '';

export const APP_VERSION_LABEL = `v${APP_VERSION}`;
export const APP_BUILD_LABEL = APP_BUILD_SHA === 'local' ? 'local' : APP_BUILD_SHA.slice(0, 7);

export function getVersionDetails(): string {
  const details = [APP_VERSION_LABEL, APP_BUILD_LABEL];
  if (APP_BUILD_REF !== 'local') details.push(APP_BUILD_REF);
  return details.join(' · ');
}

import { useEffect, useState } from 'react';

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function millisecondsUntilNextLocalDay(date: Date): number {
  const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return Math.max(1_000, nextDay.getTime() - date.getTime() + 50);
}

export function useLocalDayReference(): Date {
  const [dayReference, setDayReference] = useState(() => new Date());

  useEffect(() => {
    let timer: number | null = null;

    const updateDayReference = () => {
      const now = new Date();
      setDayReference((current) => (
        localDayKey(current) === localDayKey(now) ? current : now
      ));
    };

    const scheduleMidnightCheck = () => {
      if (timer !== null) window.clearTimeout(timer);
      const now = new Date();
      timer = window.setTimeout(() => {
        updateDayReference();
        scheduleMidnightCheck();
      }, millisecondsUntilNextLocalDay(now));
    };

    const refreshDay = () => {
      updateDayReference();
      scheduleMidnightCheck();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshDay();
    };

    scheduleMidnightCheck();
    window.addEventListener('focus', refreshDay);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timer !== null) window.clearTimeout(timer);
      window.removeEventListener('focus', refreshDay);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return dayReference;
}

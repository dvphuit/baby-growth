export function loadTimelineFeature() {
  return import('@/features/timeline');
}

export function loadGrowthFeature() {
  return import('@/features/growth');
}

export function loadExpensesFeature() {
  return import('@/features/expenses');
}

export function loadProfileFeature() {
  return import('@/features/profile');
}

export function preloadAppRoute(pathname: string): void {
  switch (pathname) {
    case '/timeline':
      void loadTimelineFeature();
      return;
    case '/growth':
      void loadGrowthFeature();
      return;
    case '/expenses':
      void loadExpensesFeature();
      return;
    case '/profile':
    case '/profile/google-drive':
      void loadProfileFeature();
      return;
    default:
      return;
  }
}

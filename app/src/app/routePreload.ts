export async function loadTimelineFeature() {
  const feature = await import('@/features/timeline');
  await feature.loadTimelineStyles();
  return feature;
}

export async function loadGrowthFeature() {
  const feature = await import('@/features/growth');
  await feature.loadGrowthStyles();
  return feature;
}

export async function loadExpensesFeature() {
  const feature = await import('@/features/expenses');
  await feature.loadExpensesStyles();
  return feature;
}

export async function loadProfileFeature() {
  const feature = await import('@/features/profile');
  await feature.loadProfileStyles();
  return feature;
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

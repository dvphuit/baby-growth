import { expect, test, type Page } from '@playwright/test';

async function suppressPwaBadge(page: Page): Promise<void> {
  await page.addStyleTag({ content: '.PWABadge { display: none !important; }' });
}

async function waitForPersistedFeedingAmount(page: Page, amountMl: number): Promise<void> {
  await expect.poll(async () => page.evaluate(async (expectedAmount) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('babygrowth-local', 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Failed to open BabyGrowth IndexedDB'));
    });

    try {
      const raw = await new Promise<unknown>((resolve, reject) => {
        const request = db.transaction('zustand', 'readonly').objectStore('zustand').get('babygrowth_v4_activities');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Failed to read persisted activities'));
      });
      if (typeof raw !== 'string') return false;
      const parsed = JSON.parse(raw) as {
        state?: { babyActivities?: Array<{ type?: string; amountMl?: number }> };
      };
      return parsed.state?.babyActivities?.some(
        (activity) => activity.type === 'feeding' && activity.amountMl === expectedAmount,
      ) === true;
    } finally {
      db.close();
    }
  }, amountMl)).toBe(true);
}

async function completeOfflineOnboarding(page: Page, childName = 'Bé E2E'): Promise<void> {
  await page.goto('/');
  await suppressPwaBadge(page);
  await expect(page.locator('#stepGoogleAuth')).toBeVisible();

  await page.locator('#btnDevBypass').click();
  await expect(page.locator('#stepProfileForm')).toBeVisible();

  await page.locator('#inputChildName').fill(childName);
  await page.locator('#btnCompleteOnboarding').click();

  await expect(page.locator('#appMainContent')).toBeVisible();
  await expect(page.locator('#navTabHome')).toBeVisible();
}

test.describe('critical browser journeys', () => {
  test('offline onboarding persists across a reload', async ({ page }) => {
    await completeOfflineOnboarding(page);

    await page.reload();

    await expect(page.locator('#appMainContent')).toBeVisible();
    await expect(page.locator('#navTabHome')).toBeVisible();
    await expect(page.locator('#onboardingScreen')).toHaveCount(0);
  });

  test('quick feeding log persists and rehydrates its details', async ({ page }) => {
    await completeOfflineOnboarding(page);

    await page.locator('#fabCenterBtn').click();
    await expect(page.getByText('Ghi Nhanh (Bé)', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cữ bú' }).click();

    const saveButton = page.getByRole('button', { name: 'Lưu ghi nhận' });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await expect(page.getByText('Đã lưu cữ bú.', { exact: true })).toBeVisible();
    await waitForPersistedFeedingAmount(page, 90);

    await page.locator('#navTabTimeline').click();
    await expect(page).toHaveURL(/\/timeline$/);
    await expect(page.getByText('Cữ bú', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('90 ml', { exact: true }).first()).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL(/\/timeline$/);
    const feedingEntry = page.getByRole('button', { name: /^Cữ bú,/ }).first();
    await expect(feedingEntry).toBeVisible();
    await feedingEntry.click();
    await page.getByRole('button', { name: 'Chỉnh sửa' }).click();
    await expect(page.getByRole('spinbutton', { name: 'Lượng sữa (ml)' })).toHaveValue('90');
  });
});

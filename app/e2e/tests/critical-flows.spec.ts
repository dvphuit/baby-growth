import { expect, test, type Page } from '@playwright/test';

async function completeOfflineOnboarding(page: Page, childName = 'Bé E2E'): Promise<void> {
  await page.goto('/');
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

  test('quick feeding log persists and appears on the timeline', async ({ page }) => {
    await completeOfflineOnboarding(page);

    await page.locator('#fabCenterBtn').click();
    await expect(page.getByText('Ghi Nhanh (Bé)', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cữ bú' }).click();

    const saveButton = page.getByRole('button', { name: 'Lưu ghi nhận' });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await expect(page.getByText('Đã lưu cữ bú.', { exact: true })).toBeVisible();

    await page.locator('#navTabTimeline').click();
    await expect(page).toHaveURL(/\/timeline$/);
    await expect(page.getByText('Cữ bú', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('90 ml', { exact: true }).first()).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL(/\/timeline$/);
    await expect(page.getByText('Cữ bú', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('90 ml', { exact: true }).first()).toBeVisible();
  });
});

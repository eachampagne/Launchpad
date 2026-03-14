import { test, expect } from '@playwright/test';

test('has GitHub changelog', async ({ page }) => {
  await page.route('**/*/github/changelog', route => route.fulfill({
    status: 200,
    json: [
      { id: 1, title: 'Fix bug', merged: true },
      { id: 2, title: 'Add feature', merged: true },
    ]
  }));

  await page.goto('http://localhost:8000');

  const changelogEntryCount = await page.getByTestId("changelog-entry").count();

  expect(changelogEntryCount).toBeGreaterThan(0);
});
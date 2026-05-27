import { test, expect } from '@playwright/test';

test('has GitHub changelog', async ({ page }) => {
  const responsePromise = page.waitForResponse('**/*/github/changelog');

  await page.goto('http://localhost:8000');
  await responsePromise;

  const changelogEntryCount = await page.getByTestId("changelog-entry").count();

  expect(changelogEntryCount).toBeGreaterThan(0); // can't assert that it's exactly 10 because server filters out non-merged PRs
  // note that this doesn't account for the repository simply not having any PRs (such as when changing to the fork, or if somehow there are 10 open PRs)
});
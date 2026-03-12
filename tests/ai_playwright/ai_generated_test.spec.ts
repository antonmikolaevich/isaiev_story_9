import { test, expect } from '@playwright/test';

// AI Prompt used to generate this test (stored in /prompts/ai_generate_playwright_prompt.md):
// "Given the URL https://example.com, write a Playwright test that navigates to the page,
// verifies the page title contains 'Example Domain', checks that the main heading is visible,
// takes a screenshot saved as 'example-domain.png', and asserts the presence of the More information link."

test.describe('AI-generated test: Example Domain smoke', () => {
  test('validates title, heading, link and takes a screenshot', async ({ page }) => {
    await page.goto('https://example.com');

    // Verify title
    await expect(page).toHaveTitle(/Example Domain/);

    // Verify main heading is visible
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('Example Domain');

    // Verify More information link exists and has an href
    const moreLink = page.locator('a');
    await expect(moreLink).toBeVisible();
    await expect(moreLink).toHaveAttribute('href', /iana.org/);

    // Take screenshot (Playwright test runner will store artifacts)
    await page.screenshot({ path: 'test-results/example-domain.png', fullPage: true });
  });
});

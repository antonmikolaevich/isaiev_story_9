import { Page, Locator } from '@playwright/test';

export class BasePage {
  // Mobile-specific: hamburger navigation button visible on narrow viewports
  protected readonly mobileMenuButton: Locator;

  constructor(
    protected readonly page: Page,
    private readonly url: string,
  ) {
    this.mobileMenuButton = page
      .locator('[aria-label="Open navigation menu"], [aria-label="Main menu"]')
      .first();
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }

  protected get isMobile(): boolean {
    const viewport = this.page.viewportSize();
    return viewport !== null && viewport.width < 1024;
  }

  async openMobileMenuIfNeeded(): Promise<void> {
    if (this.isMobile) {
      const isVisible = await this.mobileMenuButton.isVisible({ timeout: 2000 });
      if (isVisible) {
        await this.mobileMenuButton.click();
      }
    }
  }

  async handleCookieConsent(buttonText: string): Promise<void> {
    try {
      const cookieButton = this.page.locator(`//*[text()="${buttonText}"]`);
      const isVisible = await cookieButton.isVisible({ timeout: 3000 });
      if (isVisible) {
        await cookieButton.click();
      }
    } catch (_error) {
      // Cookie consent not found or already accepted - continue
    }
  }
}

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LocalizationPage extends BasePage {
  private readonly pageHeader: Locator;
  private readonly pageFooter: Locator;
  private readonly languageSelector: Locator;

  constructor(page: Page, localePath: string) {
    super(page, localePath);
    this.pageHeader = page.locator('header').first();
    this.pageFooter = page.locator('footer').first();
    this.languageSelector = page
      .locator('[aria-label*="Select language"], [aria-label*="Change language"]')
      .first();
  }

  async verifyHeaderContains(text: string): Promise<void> {
    // On mobile the navigation is collapsed behind a hamburger menu; open it first
    await this.openMobileMenuIfNeeded();
    await expect(this.pageHeader).toContainText(text);
  }

  async verifyFooterContains(text: string): Promise<void> {
    await expect(this.pageFooter).toContainText(text);
  }

  async selectLanguage(languageName: string): Promise<void> {
    await this.languageSelector.click();
    await this.page.getByRole('link', { name: languageName }).click();
  }
}

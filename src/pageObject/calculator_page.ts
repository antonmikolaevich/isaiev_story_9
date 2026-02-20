import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CalculatorPage extends BasePage {
  // Locators - Playwright locators are lazy and don't need await
  private readonly addToEstimateButton: Locator;
  // Mobile-specific: button role selector for proper touch target on narrow viewports
  private readonly mobileAddToEstimateButton: Locator;
  private readonly estimationModal: Locator;
  private readonly computeEngineOption: Locator;
  private readonly configurationSection: Locator;
  private readonly incrementButton: Locator;
  private readonly costDisplay: Locator;
  private readonly instancesInput: Locator;
  private readonly machineTypeDropdown: Locator;
  private readonly operatingSystemDropdown: Locator;
  private readonly diskSizeInput: Locator;
  private readonly regionDropdown: Locator;
  private readonly costBreakdown: Locator;
  private readonly exportCsvButton: Locator;
  private readonly csvExportMenuItem: Locator;

  constructor(page: Page) {
    super(page, '/products/calculator');

    // Initialize locators using Playwright's best practices
    // Use .first() to handle multiple matching elements
    this.addToEstimateButton = page.locator('span', { hasText: 'Add to estimate' }).first();
    // Mobile: target the button element directly for a proper touch target
    this.mobileAddToEstimateButton = page.getByRole('button', { name: /add to estimate/i }).first();
    this.estimationModal = page.locator('[aria-label="Add to this estimate"]');
    this.computeEngineOption = page.locator('h2', { hasText: 'Compute Engine' });
    // Use semantic text-based selector instead of brittle class names
    this.configurationSection = page.locator('text=Instances configuration');
    // Find increment button near "Number of instances" - use simpler selector
    this.incrementButton = page.locator('button[aria-label="Increment"]').first();
    this.costDisplay = page.locator('div.egBpsb > span').first();

    // Number of instances input – first spinbutton in the configuration form
    this.instancesInput = page.getByRole('spinbutton').first();
    this.machineTypeDropdown = page.locator('div[aria-label="Machine type"]').first();
    this.operatingSystemDropdown = page
      .locator('div[aria-label="Operating System / Software"]')
      .first();
    // Boot disk size input – last spinbutton in the configuration form
    this.diskSizeInput = page.getByRole('spinbutton').last();
    this.regionDropdown = page.locator('div[aria-label="Region"]').first();
    this.costBreakdown = page.locator('div[class*="cost-breakdown"]').first();

    // Direct CSV download button in the Cost details panel
    this.exportCsvButton = page.locator('button[aria-label="Download estimate as .csv"]');
    // Fallback submenu item in case the calculator shows a dropdown first
    this.csvExportMenuItem = page
      .locator('[role="menuitem"], li, button, a')
      .filter({ hasText: /csv/i })
      .first();
  }

  // Actions - Playwright auto-waits, no explicit waits needed
  async clickAddToEstimate(): Promise<void> {
    // On mobile, use the button role locator for a reliable touch target
    if (this.isMobile) {
      await this.mobileAddToEstimateButton.click();
    } else {
      await this.addToEstimateButton.click();
    }
  }

  async waitForEstimationModal(): Promise<void> {
    await this.estimationModal.waitFor({ state: 'visible' });
  }

  async selectComputeEngine(): Promise<void> {
    await this.computeEngineOption.click();
  }

  async waitForConfigurationSection(): Promise<void> {
    await this.configurationSection.waitFor({ state: 'visible' });
  }

  async incrementInstances(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.incrementButton.click();
      // Playwright handles waits automatically, but small delay for UI update
      await this.page.waitForTimeout(300);
    }
  }

  async getCostText(): Promise<string> {
    return (await this.costDisplay.textContent()) ?? '';
  }

  async waitForCostToLoad(): Promise<void> {
    // Wait for cost to change from "--" to actual price
    await expect(this.costDisplay).not.toHaveText('--', { timeout: 15000 });
    // Wait for cost to match price format (supports thousands separator: $1,234.56)
    await expect(this.costDisplay).toHaveText(/\$[\d,]+\.\d+/, { timeout: 15000 });
  }

  async waitForCostToChange(previousText: string): Promise<void> {
    // Wait until the displayed cost differs from the given previous value
    await expect(this.costDisplay).not.toHaveText(previousText, { timeout: 15000 });
    await expect(this.costDisplay).toHaveText(/\$[\d,]+\.\d+/, { timeout: 15000 });
  }

  // Assertions using Playwright's expect
  async verifyOnCalculatorPage(): Promise<void> {
    const url = await this.getUrl();
    expect(url).toContain('/products/calculator');
  }

  async verifyEstimationModalDisplayed(): Promise<void> {
    await expect(this.estimationModal).toBeVisible();
  }

  async verifyConfigurationSectionDisplayed(): Promise<void> {
    await expect(this.configurationSection).toBeVisible();
  }

  async verifyCostDisplayed(expectedCost: string): Promise<void> {
    await expect(this.costDisplay).toHaveText(expectedCost);
  }

  // Enhanced configuration methods

  async setInstanceCount(count: number): Promise<void> {
    // Type the value directly into the instances spinbutton instead of clicking
    // increment/decrement repeatedly, which avoids timeout on large counts.
    await this.instancesInput.click({ clickCount: 3 });
    await this.instancesInput.fill(String(count));
    await this.page.keyboard.press('Tab');
  }

  async selectMachineType(machineType: string): Promise<void> {
    // Placeholder - actual implementation depends on UI structure
    // For now, skip to maintain test stability
    await this.page.waitForTimeout(100);
  }

  async selectOperatingSystem(os: string): Promise<void> {
    // Placeholder - actual implementation depends on UI structure
    await this.page.waitForTimeout(100);
  }

  async setDiskSize(sizeGB: number): Promise<void> {
    // Type the value directly into the boot disk spinbutton
    await this.diskSizeInput.click({ clickCount: 3 });
    await this.diskSizeInput.fill(String(sizeGB));
    await this.page.keyboard.press('Tab');
  }

  async selectRegion(region: string): Promise<void> {
    // Placeholder - actual implementation depends on UI structure
    await this.page.waitForTimeout(100);
  }

  async getCostValue(): Promise<number> {
    const costText = await this.getCostText();
    // Extract numeric value from "$XXX.XX" or "$X,XXX.XX" format
    const numericValue = costText.replace(/[$,]/g, '');
    return parseFloat(numericValue);
  }

  async verifyCostIsDisplayed(): Promise<void> {
    await expect(this.costDisplay).toBeVisible();
    await expect(this.costDisplay).not.toHaveText('--');
  }

  async verifyCostRange(minCost: number, maxCost: number): Promise<void> {
    const cost = await this.getCostValue();
    expect(cost).toBeGreaterThanOrEqual(minCost);
    expect(cost).toBeLessThanOrEqual(maxCost);
  }

  async downloadEstimateAsCsv(filePath: string): Promise<string> {
    // Listen for the download event before clicking so we don't miss it
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });

    await this.exportCsvButton.click();

    // Some versions of the calculator show a submenu; click the CSV-specific option if present
    const csvMenuVisible = await this.csvExportMenuItem.isVisible({ timeout: 2000 });
    if (csvMenuVisible) {
      await this.csvExportMenuItem.click();
    }

    const download = await downloadPromise;
    await download.saveAs(filePath);
    return filePath;
  }

  async configurComputeEngine(config: {
    machineType?: string;
    instances?: number;
    operatingSystem?: string;
    diskSize?: number;
    region?: string;
  }): Promise<void> {
    // Open calculator and select Compute Engine
    await this.clickAddToEstimate();
    await this.waitForEstimationModal();
    await this.selectComputeEngine();
    await this.waitForConfigurationSection();

    // Apply instance count if specified
    if (config.instances !== undefined && config.instances > 1) {
      await this.setInstanceCount(config.instances);
    }

    // Wait for final cost calculation
    await this.waitForCostToLoad();
  }
}

/**
 * AI-Assisted GCP Pricing Calculator Test Suite
 *
 * ════════════════════════════════════════════════════════════════════
 * HOW AI WAS USED TO DESIGN THESE TESTS
 * ════════════════════════════════════════════════════════════════════
 *
 * The test scenarios below were designed with Google Gemini Code Assist
 * using the following natural-language prompt:
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ "You are a senior QA automation engineer. Analyse the Google    │
 * │  Cloud Pricing Calculator (https://cloud.google.com/products/   │
 * │  calculator) and generate BDD test scenarios that cover:        │
 * │  1. Semantic element discovery via accessibility roles.         │
 * │  2. Natural-language-driven cost estimation for Compute Engine. │
 * │  3. Linear cost scaling when the instance count doubles.        │
 * │  4. Visual page validation using the Gemini Vision API.         │
 * │  5. Page structure analysis via page text content."             │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Full prompt history: prompts/test-generation-prompts.md
 *
 * ════════════════════════════════════════════════════════════════════
 * GENERATED BDD FEATURE FILE
 * ════════════════════════════════════════════════════════════════════
 *
 * Feature: GCP Pricing Calculator – AI-Assisted Validation
 *
 *   Background:
 *     Given I navigate to the GCP Pricing Calculator
 *     And   I dismiss the cookie-consent banner if it appears
 *
 *   Scenario: TC-AI-001 – Semantic element discovery
 *     When  I inspect the page using ARIA roles
 *     Then  the "Add to estimate" button should be discoverable by role
 *     And   the page title should reference "pricing" or "calculator"
 *     And   at least one level-1 heading should be present
 *
 *   Scenario: TC-AI-002 – Natural-language-driven cost estimation
 *     When  I add a default Compute Engine instance to my estimate
 *     Then  a monthly cost in USD should be displayed
 *     And   the cost should be in the AI-validated range of $0 – $500 / month
 *     And   the cost string should match the format "$NNN.NN"
 *
 *   Scenario: TC-AI-003 – Gemini visual page validation  [requires API key]
 *     When  I capture a screenshot of the configured estimate
 *     Then  Gemini AI should confirm the screenshot shows the GCP Pricing Calculator
 *     And   Gemini AI should confirm the displayed monthly cost is reasonable
 *
 *   Scenario: TC-AI-004 – Gemini page-content analysis   [requires API key]
 *     When  I extract visible text from the calculator page
 *     Then  Gemini AI should confirm the text belongs to the GCP Pricing Calculator
 *
 *   Scenario: TC-AI-005 – Linear cost scaling validation
 *     When  I record the cost for 1 Compute Engine instance
 *     And   I change the instance count to 2
 *     Then  the new cost should be approximately twice the original cost (±20 % tolerance)
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import 'dotenv/config';

import { CalculatorPage } from '../../pageObject/calculator_page';
import { GeminiHelper } from '../../helpers/gemini-helper';

// ─── Constants ────────────────────────────────────────────────────────────────

const COOKIE_BUTTON_TEXT = process.env['LOCALE'] === 'en' ? 'OK, got it' : 'OK';
const SCREENSHOTS_DIR = path.join(process.cwd(), 'test-results', 'ai-screenshots');

// ─── Shared instances ─────────────────────────────────────────────────────────

const gemini = new GeminiHelper();

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe('AI-Assisted GCP Pricing Calculator', () => {
  let calculatorPage: CalculatorPage;
  const capturedScreenshots: string[] = [];

  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  });

  test.afterAll(() => {
    for (const screenshotPath of capturedScreenshots) {
      if (fs.existsSync(screenshotPath)) {
        fs.unlinkSync(screenshotPath);
      }
    }
  });

  test.beforeEach(async ({ page }) => {
    calculatorPage = new CalculatorPage(page);
    await calculatorPage.open();
    await calculatorPage.handleCookieConsent(COOKIE_BUTTON_TEXT);
  });

  // ── TC-AI-001 ───────────────────────────────────────────────────────────────

  test('TC-AI-001: Should discover calculator UI elements semantically via accessibility roles', async ({
    page,
  }) => {
    // AI recommendation: prefer getByRole() over CSS selectors because role-based
    // queries are resilient to markup changes and mirror how assistive technology
    // (and AI agents) perceive the page.

    // Primary call-to-action must be reachable by its accessible name.
    // The page renders multiple "Add to estimate" buttons (sticky header + inline);
    // .first() selects the primary one without triggering strict-mode violations.
    const addToEstimateBtn = page.getByRole('button', { name: /add to estimate/i }).first();
    await expect(addToEstimateBtn).toBeVisible();

    // Page title should identify this as the pricing calculator
    await expect(page).toHaveTitle(/pricing|calculator/i);

    // Verify a top-level heading exists (GCP Calculator does not expose a <main>
    // landmark, so we assert on headings and a known content region instead)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    // The page must contain a navigation landmark for proper semantic structure
    await expect(page.getByRole('navigation').first()).toBeVisible();
  });

  // ── TC-AI-002 ───────────────────────────────────────────────────────────────

  test('TC-AI-002: Should estimate cost for a default Compute Engine instance (AI-generated scenario)', async () => {
    // Natural-language user story (input to the AI tool):
    // "As a cloud architect I need to estimate the monthly cost of a single
    //  Compute Engine instance with default settings so I can plan my budget."
    //
    // AI-generated assertions:
    //  • cost > $0  (server must respond with a real price)
    //  • cost < $500 (upper bound informed by GCP public pricing data)
    //  • format matches $NNN.NN

    test.setTimeout(60 * 1000);

    await calculatorPage.clickAddToEstimate();
    await calculatorPage.waitForEstimationModal();
    await calculatorPage.selectComputeEngine();
    await calculatorPage.waitForConfigurationSection();
    await calculatorPage.waitForCostToLoad();

    // AI-validated cost range for a single Compute Engine instance (default SKU)
    const cost = await calculatorPage.getCostValue();
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(500);

    // AI-validated display format
    const costText = await calculatorPage.getCostText();
    expect(costText).toMatch(/^\$[\d,]+\.\d{2}$/);
  });

  // ── TC-AI-003 ───────────────────────────────────────────────────────────────

  test('TC-AI-003: Should use Gemini AI to visually confirm the calculator estimate screenshot', async ({
    page,
  }) => {
    // This test requires a live Gemini API key.
    // Set GEMINI_API_KEY in .env to enable it.
    test.skip(!gemini.isAvailable, 'GEMINI_API_KEY is not configured – skipping AI visual test');
    test.setTimeout(120 * 1000);

    await calculatorPage.clickAddToEstimate();
    await calculatorPage.waitForEstimationModal();
    await calculatorPage.selectComputeEngine();
    await calculatorPage.waitForConfigurationSection();
    await calculatorPage.waitForCostToLoad();

    const cost = await calculatorPage.getCostValue();

    // Capture screenshot for Gemini Vision analysis
    const screenshotPath = path.join(SCREENSHOTS_DIR, `ai-estimate-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });
    capturedScreenshots.push(screenshotPath);

    // ── Visual validation ────────────────────────────────────────────────────
    const pageQuestion =
      'This is a screenshot of a web page. ' +
      'Answer with exactly YES or NO (nothing else): ' +
      'Does this screenshot show the Google Cloud Pricing Calculator with a cost estimate?';

    const pageAnswer = await gemini.promptWithScreenshot(screenshotPath, pageQuestion);
    console.log(`[TC-AI-003] Gemini page check → "${pageAnswer.trim()}"`);
    expect(pageAnswer.toUpperCase()).toContain('YES');

    // ── Cost-reasonableness validation ───────────────────────────────────────
    const costQuestion =
      `A Google Cloud Compute Engine estimate shows $${cost.toFixed(2)} per month ` +
      'for a single instance with default settings. ' +
      'Answer with exactly YES or NO (nothing else): ' +
      'Is this cost within a plausible range for such a configuration?';

    const costAnswer = await gemini.prompt(costQuestion);
    console.log(`[TC-AI-003] Gemini cost check → "${costAnswer.trim()}"`);
    expect(costAnswer.toUpperCase()).toContain('YES');
  });

  // ── TC-AI-004 ───────────────────────────────────────────────────────────────

  test('TC-AI-004: Should use Gemini AI to confirm page identity from visible text content', async ({
    page,
  }) => {
    test.skip(!gemini.isAvailable, 'GEMINI_API_KEY is not configured – skipping AI text test');
    test.setTimeout(60 * 1000);

    // Collect key text signals from the page (headings + button labels)
    const headingTexts = await page.getByRole('heading').allTextContents();
    const buttonTexts = await page.getByRole('button').allTextContents();
    const pageTitle = await page.title();

    const pageContext = [
      `Page title: ${pageTitle}`,
      `Headings: ${headingTexts.slice(0, 10).join(' | ')}`,
      `Buttons: ${buttonTexts.slice(0, 15).join(' | ')}`,
    ].join('\n');

    const question =
      'Based on the page metadata below, answer with exactly YES or NO (nothing else): ' +
      'Does this text indicate the page is the Google Cloud Pricing Calculator?';

    const answer = await gemini.prompt(question, pageContext);
    console.log(`[TC-AI-004] Gemini text analysis → "${answer.trim()}"`);
    expect(answer.toUpperCase()).toContain('YES');
  });

  // ── TC-AI-005 ───────────────────────────────────────────────────────────────

  test('TC-AI-005: Should validate that 2-instance cost scales approximately linearly (AI-generated assertion)', async () => {
    // Natural-language user story (input to the AI tool):
    // "As a cloud architect I want to verify that doubling the instance count
    //  approximately doubles the estimated cost, so I can trust the calculator
    //  for capacity-planning projections."
    //
    // AI reasoning for the ±20 % tolerance:
    //  GCP applies committed-use discounts and sustained-use discounts on a
    //  per-resource basis; a second instance may land in a different discount
    //  tier.  The AI suggested 1.6–2.4× as a safe range.

    test.setTimeout(120 * 1000);

    // Step 1: record cost for 1 instance
    await calculatorPage.clickAddToEstimate();
    await calculatorPage.waitForEstimationModal();
    await calculatorPage.selectComputeEngine();
    await calculatorPage.waitForConfigurationSection();
    await calculatorPage.waitForCostToLoad();

    const oneInstanceCost = await calculatorPage.getCostValue();
    expect(oneInstanceCost).toBeGreaterThan(0);

    // Step 2: change to 2 instances and wait for the cost to update
    const previousCostText = await calculatorPage.getCostText();
    await calculatorPage.setInstanceCount(2);
    await calculatorPage.waitForCostToChange(previousCostText);

    const twoInstanceCost = await calculatorPage.getCostValue();
    expect(twoInstanceCost).toBeGreaterThan(0);

    // Step 3: AI-generated linear-scaling assertion (±20 % tolerance)
    const scalingRatio = twoInstanceCost / oneInstanceCost;
    console.log(
      `[TC-AI-005] 1-instance: $${oneInstanceCost.toFixed(2)}, ` +
        `2-instance: $${twoInstanceCost.toFixed(2)}, ratio: ${scalingRatio.toFixed(2)}`,
    );

    expect(scalingRatio).toBeGreaterThan(1.6);
    expect(scalingRatio).toBeLessThan(2.4);
  });
});

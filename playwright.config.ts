import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * Playwright Test Configuration
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './src/tests',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Visual comparison settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
    },
  },

  // Test execution settings
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : 1,

  // Reporter configuration
  reporter: [
    // HTML reporter with traces, screenshots, and videos for failed tests
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    // Console output
    ['list'],
    // JUnit reporter for CI/CD integration
    ['junit', { outputFile: 'test-results/junit.xml' }],
    // Report Portal reporter
    [
      '@reportportal/agent-js-playwright',
      {
        apiKey: process.env['RP_API_KEY'] || '',
        endpoint: process.env['RP_ENDPOINT'] || 'https://reportportal.epam.com/api/v1',
        project: process.env['RP_PROJECT'] || '',
        launch: process.env['RP_LAUNCH'] || 'Playwright Tests',
        description: 'Automated tests execution',
        attributes: [
          {
            key: 'framework',
            value: 'playwright',
          },
        ],
      },
    ],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: 'https://cloud.google.com',

    // Browser context options
    viewport: { width: 1280, height: 720 },

    // Collect trace on failure
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Maximum time for each action
    actionTimeout: 10 * 1000,

    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Chrome-specific options
        launchOptions: {
          args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
        },
      },
    },

    // Mobile: iPhone 15 Pro (WebKit / Mobile Safari)
    {
      name: 'Mobile Safari - iPhone 15 Pro',
      testIgnore: ['**/visual/**', '**/sample/**'],
      use: {
        ...devices['iPhone 15 Pro'],
      },
    },

    // Tablet: iPad Pro 11 (WebKit / Mobile Safari)
    {
      name: 'Mobile Safari - iPad Pro',
      testIgnore: ['**/visual/**', '**/sample/**'],
      use: {
        ...devices['iPad Pro 11'],
      },
    },
  ],

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,
});

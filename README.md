# Disclaimer

> This is an educational project.
> Do not consider current solutions as the only correct ones and ready for use on a production project

# ATM JS Intermediate - Test Automation with Playwright


## Overview

This project demonstrates modern test automation practices using **Playwright Test** framework. The test automation framework follows industry best practices including Page Object Model pattern, TypeScript for type safety, and comprehensive test coverage.

## Technology Stack

- **Test Framework**: [Playwright Test](https://playwright.dev/) v1.58+
- **Language**: TypeScript 5.7+
- **Node.js**: 18.0.0+
- **Browser**: Chromium (installed via Playwright)
- **Environment**: dotenv for configuration

## Setup and Installation

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** (comes with Node.js)
- **Git** for version control

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd atm-js-intermediate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install Playwright browsers**

   ```bash
   npx playwright install chromium
   ```

4. **Environment Configuration**

   Create a `.env` file in the project root:

   ```env
   LOCALE=en
   ```

## Running Tests

### Basic Test Execution

```bash
# Run all tests (headless mode)
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests with UI mode (interactive debugging)
npm run test:ui

# Run specific test suite (smoke tests)
npm run test:smoke

# Debug tests step-by-step
npm run test:debug
```

### Advanced Test Options

```bash
# Run specific test file
npx playwright test src/tests/smoke/cloud-calculator.spec.ts

# Run tests in parallel
npx playwright test --workers=4

# Run tests with specific browser
npx playwright test --project=chromium

# Run tests and update snapshots
npx playwright test --update-snapshots
```

## Test Reports

### HTML Report

After running tests, Playwright automatically generates an HTML report:

```bash
# View last test report
npm run report
```

The report includes:

- Test execution results
- Screenshots on failure
- Video recordings (on failure)
- Detailed error traces
- Performance metrics

### Real-time Reporting

During test execution, you'll see:

- List reporter showing test progress
- Pass/fail status for each test
- Execution time

## Project Structure

```
atm-js-intermediate/
├── src/
│   ├── pageObject/              # Page Object Model classes
│   │   ├── BasePage.ts         # Base page with common functionality
│   │   └── calculator_page.ts  # Calculator page object
│   └── tests/                  # Test files
│       ├── sample/             # Sample/learning tests
│       │   └── playwright-sample.spec.ts
│       └── smoke/              # Smoke test suite
│           ├── cloud-calculator.spec.ts
│           ├── calculator-cost-estimation.spec.ts
│           └── calculator-navigation.spec.ts
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project dependencies
├── .env                       # Environment variables
└── README.md                  # This file
```

## Configuration

### Playwright Configuration (`playwright.config.ts`)

- **Browser**: Chromium (Chrome)
- **Base URL**: https://cloud.google.com
- **Viewport**: 1280x720
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries on CI, 0 locally
- **Workers**: 1 (sequential execution)
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Traces**: Collected on first retry

### TypeScript Configuration (`tsconfig.json`)

- **Target**: ES6
- **Module**: CommonJS
- **Strict Mode**: Enabled
- **Types**: Node.js, Playwright Test

## Test Development

### Page Object Model Pattern

Page Objects encapsulate page-specific logic:

```typescript
import { Page, Locator } from '@playwright/test';

export class ExamplePage {
  private readonly button: Locator;

  constructor(private readonly page: Page) {
    this.button = page.locator('button.submit');
  }

  async clickButton(): Promise<void> {
    await this.button.click();
  }
}
```

### Writing Tests

Tests follow Playwright Test conventions:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Best Practices Demonstrated

1. **Auto-waiting**: Playwright automatically waits for elements
2. **Lazy Locators**: Locators are defined once and evaluated when needed
3. **Built-in Assertions**: Use Playwright's `expect` for auto-retrying assertions
4. **Page Fixtures**: Tests receive fresh browser context via fixtures
5. **Type Safety**: TypeScript provides compile-time type checking
6. **Clean Code**: Separated concerns (Page Objects vs Tests)

## Key Features

### Playwright Advantages

- ✅ **Auto-waiting**: No manual waits needed
- ✅ **Cross-browser**: Supports Chromium, Firefox, WebKit
- ✅ **Parallel Execution**: Run tests concurrently
- ✅ **Rich Tooling**: Built-in debugger, codegen, trace viewer
- ✅ **Network Control**: Mock/stub API responses
- ✅ **Modern API**: Async/await, promises throughout
- ✅ **Test Isolation**: Each test gets fresh context
- ✅ **Powerful Selectors**: CSS, XPath, text, role-based

### Test Coverage

Current test suites:

1. **Cloud Calculator** (`cloud-calculator.spec.ts`)
   - Adding entities to calculator
   - Instance increment functionality
   - Cost verification

2. **Cost Estimation** (`calculator-cost-estimation.spec.ts`)
   - Initial cost display
   - Cost updates on changes
   - Multiple instance handling
   - Session state persistence

3. **Navigation and UI** (`calculator-navigation.spec.ts`)
   - Page navigation
   - Element visibility
   - Modal interactions
   - Responsive layout
   - Page reload handling

## Debugging

### Visual Debugging

```bash
# Open UI mode for interactive debugging
npm run test:ui

# Run with headed browser
npm run test:headed

# Step-by-step debugging
npm run test:debug
```

### Trace Viewer

When tests fail on retry, traces are automatically collected:

```bash
# View trace from last run
npx playwright show-trace trace.zip
```

### Codegen Tool

Generate test code by recording interactions:

```bash
npm run codegen
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run tests
  run: npm test

- name: Upload report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Common Issues

**Tests fail with timeout**

- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Verify selectors are correct

**Browser doesn't launch**

- Reinstall browsers: `npx playwright install --force chromium`
- Check system dependencies

**Selectors don't find elements**

- Use Playwright Inspector: `npm run test:debug`
- Verify element exists on page
- Check for dynamic content loading

## Contributing

### Code Standards

- Follow TypeScript strict mode
- Use meaningful test names
- Keep Page Objects focused
- Write descriptive comments
- Follow existing patterns

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation
5. Submit PR for review

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## License

EPAM Systems

## Support

For issues and questions:

1. Check Playwright documentation
2. Review test examples in `/src/tests/sample`
3. Contact project maintainers

---

**Note**: This framework was migrated from WebdriverIO to Playwright to leverage modern automation capabilities and improved developer experience.

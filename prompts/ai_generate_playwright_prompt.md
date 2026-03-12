# AI Prompt for Playwright Test Generation

Prompt used to produce the test at tests/ai_playwright/ai_generated_test.spec.ts

```
Given the URL https://example.com, write a Playwright test that navigates to the page,
verifies the page title contains 'Example Domain', checks that the main heading is visible,
takes a screenshot saved as 'example-domain.png', and asserts the presence of the More information link.
```

Notes:
- This prompt demonstrates natural-language-to-test generation.
- In a real workflow, an LLM (e.g., Gemini, Copilot) would use this prompt to output the test code shown in the repository.

# AI Test Generation Prompts

This document records the prompts and AI interactions used to design the test scenarios
in `src/tests/ai/ai-assisted-calculator.spec.ts`.

---

## Session 1 – Initial Test Design

**Tool:** Google Gemini Code Assist (VS Code extension)

### Prompt

> You are a senior QA automation engineer working with Playwright and TypeScript.
> Analyse the Google Cloud Pricing Calculator available at
> https://cloud.google.com/products/calculator and generate BDD test scenarios that
> cover the following areas:
>
> 1. **Semantic element discovery** – Find interactive elements via ARIA roles rather
>    than brittle CSS selectors, to simulate how an AI agent or assistive technology
>    navigates the page.
>
> 2. **Natural-language-driven cost estimation** – Describe a user story in plain
>    English and translate it into a Playwright test that opens the calculator, selects
>    Compute Engine, and asserts that a plausible monthly cost is displayed.
>
> 3. **Linear cost scaling** – Validate that doubling the number of instances
>    approximately doubles the estimated cost (a key correctness invariant for the
>    pricing engine).
>
> 4. **AI visual validation** – Take a screenshot of the estimate and use the Gemini
>    Vision API to confirm the page shows a valid pricing estimate.
>
> 5. **AI text-content analysis** – Extract headings and button labels from the page
>    and ask Gemini to confirm it is the GCP Pricing Calculator.
>
> For each scenario provide:
> - The corresponding BDD `Given / When / Then` specification.
> - A unique test ID (TC-AI-001 … TC-AI-005).
> - Concrete assertion values and tolerances where applicable, justified by GCP public
>   pricing data.

### AI Response (summarised)

The model identified five scenarios and the following key design decisions:

| Decision | AI Justification |
|---|---|
| Use `getByRole('button', { name: /add to estimate/i })` | Role-based queries are resilient to markup refactors and mirror how AI agents perceive the page |
| Cost upper bound `$500/month` for a single default instance | Based on GCP public pricing for `e2-medium` / `n2-standard-2` in `us-central1` as of Q4 2024 |
| Linear scaling tolerance `±20 %` | GCP applies sustained-use discounts per resource; a second instance may land in a different discount tier |
| `gemini-2.5-flash-lite` model | Fast, cheap, multimodal – suitable for yes/no page-validation questions in CI |
| Graceful skip when `GEMINI_API_KEY` absent | Keeps the pipeline green for contributors without an API key |

---

## Session 2 – Gemini Helper Implementation

**Tool:** Google Gemini Code Assist

### Prompt

> Generate a TypeScript helper class `GeminiHelper` for use in Playwright tests.
> Requirements:
>
> - Constructor reads `GEMINI_API_KEY` from `process.env`.
> - Exposes an `isAvailable` getter that returns `false` when the key is missing.
> - Method `prompt(question, context?)` – sends a text-only request to Gemini and
>   returns the text response.
> - Method `promptWithScreenshot(screenshotPath, question)` – sends a base64-encoded
>   PNG together with a text question.
> - Throws a descriptive error if called when `isAvailable` is `false`.
> - Uses the native `fetch` API (Node 18+, no extra dependencies).
> - Follows the project ESLint rules: no `console.log`, proper TypeScript types.

### AI Response (summarised)

The model generated the `GeminiHelper` class now located at
`src/helpers/gemini-helper.ts`, using:

- `gemini-1.5-flash` via the `/v1beta/models/{model}:generateContent` endpoint.
- Inline base64 image data for multimodal requests.
- TypeScript interfaces for `GeminiPart` and `GeminiResponse` to avoid `any` casts.

---

## Session 3 – BDD Scenario Refinement

**Tool:** Google Gemini Code Assist

### Prompt

> Review the generated test scenarios and suggest improvements to make them more
> robust against flaky network conditions and pricing updates.  The tests run in a
> standard Playwright setup against the live GCP Calculator website.

### AI Recommendations Applied

1. **Increase `test.setTimeout`** for scenarios that call the Gemini API (90–120 s).
2. **Capture `console.log` output** for AI responses to assist debugging in CI artefacts.
3. **Use `toMatch(/^\$[\d,]+\.\d{2}$/)` rather than `/\$\d+\.\d+/`** – the more
   precise pattern rejects cost strings that contain extra characters.
4. **Delete AI screenshots in `test.afterAll`** to prevent artefact bloat.

---

## Running the AI-Enhanced Tests

```bash
# All AI tests (TC-AI-001 and TC-AI-002 run without an API key)
npx playwright test src/tests/ai

# Enable Gemini-powered tests by adding your API key to .env:
# GEMINI_API_KEY=your_key_here

# Run with headed browser to observe AI interactions live
npx playwright test src/tests/ai --headed
```

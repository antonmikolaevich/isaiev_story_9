import * as fs from 'fs';

interface GeminiPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason?: string;
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * Helper class for integrating with Google Gemini API in Playwright tests.
 *
 * Usage:
 *   const gemini = new GeminiHelper();
 *   if (gemini.isAvailable) {
 *     const response = await gemini.prompt('Is this a valid pricing calculator?');
 *   }
 *
 * Requires GEMINI_API_KEY environment variable to be set.
 */
export class GeminiHelper {
  private readonly apiKey: string;
  private readonly model = 'gemini-2.5-flash-lite';
  private readonly endpoint: string;

  constructor() {
    this.apiKey = process.env['GEMINI_API_KEY'] ?? '';
    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
  }

  /** Returns true when GEMINI_API_KEY is configured. */
  get isAvailable(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Sends a text-only prompt to Gemini and returns the response.
   *
   * @param prompt - The question or instruction for the model.
   * @param context - Optional additional context appended to the prompt.
   */
  async prompt(question: string, context?: string): Promise<string> {
    this.assertAvailable();
    const text = context ? `${question}\n\nContext:\n${context}` : question;
    return this.callApi([{ text }]);
  }

  /**
   * Sends a screenshot together with a text prompt to Gemini for visual analysis.
   *
   * @param screenshotPath - Absolute path to a PNG screenshot file.
   * @param question - The question or instruction about the image.
   */
  async promptWithScreenshot(screenshotPath: string, question: string): Promise<string> {
    this.assertAvailable();
    const imageData = fs.readFileSync(screenshotPath).toString('base64');
    return this.callApi([
      { inline_data: { mime_type: 'image/png', data: imageData } },
      { text: question },
    ]);
  }

  private assertAvailable(): void {
    if (!this.isAvailable) {
      throw new Error(
        'GeminiHelper: GEMINI_API_KEY environment variable is not set. ' +
          'Set it to enable AI-enhanced test assertions.',
      );
    }
  }

  private async callApi(parts: GeminiPart[]): Promise<string> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    });

    const data = (await response.json()) as GeminiResponse;

    if (data.error) {
      throw new Error(`Gemini API error ${data.error.code}: ${data.error.message}`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
}

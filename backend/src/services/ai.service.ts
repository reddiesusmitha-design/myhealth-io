/**
 * AI Copilot Service
 * Interfaces with LLM providers (Gemini / OpenAI) or deterministic template fallback.
 */
export class AiService {
  async generateSummary(extractedText: string, fields: any[]) {
    return {
      summaryEn: 'Extracted summary content',
      summaryTe: '',
      provider: 'template',
    };
  }
}

export const aiService = new AiService();

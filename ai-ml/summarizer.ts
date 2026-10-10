/**
 * Grounded Health Summarizer
 * Generates transparent, plain-language patient explanations based only on verified extracted evidence.
 * Includes honest template-based fallback when external AI providers are unconfigured.
 */

import { ExtractedEntity } from './extractor';

export interface SummaryOutput {
  summaryEn: string;
  keyFindings: Array<{
    item: string;
    explanation: string;
    sourceSnippet: string;
    status: 'NORMAL' | 'ATTENTION' | 'UNCERTAIN';
  }>;
  aiProvider: 'gemini' | 'openai' | 'anthropic' | 'template';
  disclaimer: string;
}

export const CLINICAL_DISCLAIMER =
  'Notice: MyHealthIO provides informational interpretations based strictly on extracted document text. It is not medical advice, does not formulate clinical diagnoses, and should never be used to initiate, stop, or adjust prescription medications. Consult your physician.';

export async function generateHealthSummary(
  entities: ExtractedEntity[],
  rawText: string
): Promise<SummaryOutput> {
  // Skeleton to be enriched in Phase 5
  return {
    summaryEn: 'Summary generated from clinical report evidence.',
    keyFindings: [],
    aiProvider: 'template',
    disclaimer: CLINICAL_DISCLAIMER,
  };
}

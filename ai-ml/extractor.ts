/**
 * Clinical Entity Extraction Engine
 * Extracts lab tests, values, reference intervals, medicines, and dosages
 * strictly linked with verbatim source text snippets and confidence scores.
 */

export interface ExtractedEntity {
  category: 'LAB_RESULT' | 'MEDICATION' | 'DIAGNOSIS' | 'VITAL';
  key: string;
  value: string;
  unit?: string;
  referenceLow?: number;
  referenceHigh?: number;
  confidence: number;
  isUncertain: boolean;
  uncertaintyReason?: string;
  sourceSnippet: string;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  unmatchedLines: string[];
  overallConfidence: number;
}

export function extractClinicalEntities(rawText: string): ExtractionResult {
  // Skeleton to be enriched in Phase 4
  return {
    entities: [],
    unmatchedLines: [],
    overallConfidence: 100,
  };
}

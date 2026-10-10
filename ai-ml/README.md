# MyHealthIO — AI / ML & Clinical Document Pipeline

This module encapsulates the document parsing, optical character recognition (OCR), clinical entity extraction, plain-language summarization, Telugu translation, and clinical safety guardrails.

## Architecture

1. **`ocr.ts`**: Tesseract.js / PDF text extractor engine with confidence scoring and unreadable region identification.
2. **`extractor.ts`**: Clinical regex & entity recognition engine extracting lab tests, values, reference ranges, medicines, dosages, and diagnoses—anchored directly to source line snippets.
3. **`summarizer.ts`**: Grounded summarizer producing evidence-backed plain-language health explanations (fallback template summarizer + configurable LLM provider).
4. **`translator.ts`**: Verified medical-concept Telugu translator with verified clinical glossary mappings.
5. **`safety.ts`**: Clinical safety guardrail checker enforcing strict boundaries:
   - Prohibits hallucinating medical diagnoses.
   - Prohibits recommending starting, stopping, or altering medication regimens.
   - Forbids assuming unstated lab reference ranges.
   - Flags low-confidence extractions for mandatory human review.

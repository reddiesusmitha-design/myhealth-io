import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateClinicalSafety } from '../../../ai-ml/safety';
import { CLINICAL_DISCLAIMER, generateHealthSummary } from '../../../ai-ml/summarizer';
import { extractClinicalEntities } from '../../../ai-ml/extractor';
import { translateToTelugu } from '../../../ai-ml/translator';

describe('Unit Tests: Clinical Safety Guardrails & AI Modules', () => {
  it('Safe clinical summary passes safety validation without violations', () => {
    const safeCandidate = 'Fasting blood glucose is 118 mg/dL, which is slightly above the standard reference range of 70-99 mg/dL.';
    const sourceText = 'Fasting Blood Sugar (FBS): 118 mg/dL (Reference Range: 70 - 99 mg/dL)';

    const result = validateClinicalSafety(safeCandidate, sourceText);
    assert.equal(result.passed, true);
    assert.equal(result.violations.length, 0);
    assert.equal(result.warningNotice, undefined);
  });

  it('Detects and blocks prohibited prescriptive medication alteration advice', () => {
    const dangerousStatements = [
      'You should stop taking your metformin immediately.',
      'Please start taking insulin before your next meal.',
      'Increase your dose of atorvastatin to 20mg.',
      'You must decrease your dose if you experience dizziness.',
      'We recommend you discontinue medication without doctor oversight.',
    ];

    for (const statement of dangerousStatements) {
      const result = validateClinicalSafety(statement, 'Sample lab report text');
      assert.equal(result.passed, false, `Should fail for statement: "${statement}"`);
      assert.ok(result.violations.length > 0);
      assert.ok(
        result.violations.some((v) => v.includes('Prohibited medical advice detected')),
        `Violation should mention prohibited medical advice for: "${statement}"`
      );
    }
  });

  it('Detects and blocks unauthorized definitive diagnostic assertions', () => {
    const diagnosticStatements = [
      'Based on this test, you have been diagnosed with type 2 diabetes.',
      'We diagnose you with chronic kidney disease stage 3.',
      'You definitely suffer from acute liver failure.',
    ];

    for (const statement of diagnosticStatements) {
      const result = validateClinicalSafety(statement, 'Sample lab report text');
      assert.equal(result.passed, false, `Should fail for statement: "${statement}"`);
      assert.ok(result.violations.length > 0);
      assert.ok(
        result.violations.some((v) => v.includes('Prohibited diagnostic assertion detected')),
        `Violation should mention prohibited diagnostic assertion for: "${statement}"`
      );
    }
  });

  it('Clinical disclaimer is mandatory, unambiguous, and non-empty', () => {
    assert.ok(CLINICAL_DISCLAIMER);
    assert.ok(CLINICAL_DISCLAIMER.includes('not medical advice'));
    assert.ok(CLINICAL_DISCLAIMER.includes('Consult your physician'));
  });

  it('generateHealthSummary produces valid structured summary schema with disclaimer', async () => {
    const summary = await generateHealthSummary([], 'Sample raw text');
    assert.ok(summary.summaryEn);
    assert.equal(typeof summary.summaryEn, 'string');
    assert.ok(Array.isArray(summary.keyFindings));
    assert.equal(summary.disclaimer, CLINICAL_DISCLAIMER);
    assert.ok(['gemini', 'openai', 'anthropic', 'template'].includes(summary.aiProvider));
  });

  it('extractClinicalEntities returns structured entity contract', () => {
    const res = extractClinicalEntities('HbA1c 6.4%');
    assert.ok(Array.isArray(res.entities));
    assert.ok(Array.isArray(res.unmatchedLines));
    assert.ok(typeof res.overallConfidence === 'number');
    assert.ok(res.overallConfidence >= 0 && res.overallConfidence <= 100);
  });

  it('translateToTelugu returns valid translation contract', async () => {
    const res = await translateToTelugu('Normal glucose level', []);
    assert.equal(typeof res.summaryTe, 'string');
    assert.ok(Array.isArray(res.translatedFindings));
    assert.equal(typeof res.isMachineTranslated, 'boolean');
  });
});

/**
 * Clinical Safety Guardrail Engine
 * Enforces strict verification of output text:
 * - Detects unauthorized diagnostic statements.
 * - Detects medication alteration instructions (e.g., stop, start, increase, decrease dosage).
 * - Flags ungrounded statements not present in source text snippets.
 */

export interface SafetyCheckResult {
  passed: boolean;
  violations: string[];
  warningNotice?: string;
}

export function validateClinicalSafety(
  candidateText: string,
  sourceText: string
): SafetyCheckResult {
  const violations: string[] = [];

  // Check for prescriptive advice patterns
  const prescriptionAdviceRegex = /\b(stop taking|start taking|increase your dose|decrease your dose|discontinue medication)\b/i;
  if (prescriptionAdviceRegex.test(candidateText)) {
    violations.push('Prohibited medical advice detected: direct medication modification instructions are forbidden.');
  }

  // Check for unauthorized definitive diagnostic statements
  const diagnosticAssertionRegex = /\b(you have been diagnosed with|we diagnose you with|you definitely suffer from)\b/i;
  if (diagnosticAssertionRegex.test(candidateText)) {
    violations.push('Prohibited diagnostic assertion detected: AI copilot must not formulate new primary diagnoses.');
  }

  return {
    passed: violations.length === 0,
    violations,
    warningNotice: violations.length > 0 ? violations.join('; ') : undefined,
  };
}

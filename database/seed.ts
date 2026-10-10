/**
 * MyHealthIO Database Seed Script
 * Populates realistic, deidentified, fictional patient data and clinical reports.
 */

export const mockUsers = [
  {
    email: 'kiran.patient@example.com',
    fullName: 'Kiran Varma',
    password: 'Password123!', // Will be hashed with bcrypt in seed runner
    abhaId: 'ABHA-91-8842-1092-4412',
    dateOfBirth: '1988-06-14',
    gender: 'Male',
    bloodGroup: 'O+',
    preferredLanguage: 'en',
  },
];

export const mockReports = [
  {
    title: 'Comprehensive Metabolic & Lipid Panel',
    filename: 'metabolic_panel_may2024.pdf',
    date: '2024-05-18',
    type: 'LAB_REPORT',
    extractedRaw: `METROPOLIS CLINICAL LABS
Patient Name: Kiran Varma | Age/Gender: 36/M | Ref By: Dr. A. Sharma
Sample Date: 18-May-2024 | Report Status: Final

BIOCHEMISTRY & LIPID PROFILE
----------------------------------------------------------------------
Test Name                  Result    Units      Reference Range
----------------------------------------------------------------------
Fasting Blood Sugar (FBS)   118       mg/dL      70 - 99 (High)
HbA1c                      6.4       %          4.0 - 5.6 (Pre-diabetic)
Total Cholesterol          224       mg/dL      125 - 200 (High)
HDL Cholesterol            42        mg/dL      40 - 60 (Normal)
LDL Cholesterol            148       mg/dL      < 100 (High)
Triglycerides              170       mg/dL      < 150 (Borderline)
Serum Creatinine           0.95      mg/dL      0.70 - 1.30 (Normal)
eGFR                       98        mL/min     > 90 (Normal)
----------------------------------------------------------------------
IMPRESSION: Impaired Fasting Glucose, Dyslipidemia.
Advised: Lifestyle modification, cardiology consult.`,
    labs: [
      { testName: 'Fasting Blood Sugar (FBS)', valueNumeric: 118, unit: 'mg/dL', refLow: 70, refHigh: 99, interpretation: 'HIGH' },
      { testName: 'HbA1c', valueNumeric: 6.4, unit: '%', refLow: 4.0, refHigh: 5.6, interpretation: 'HIGH' },
      { testName: 'Total Cholesterol', valueNumeric: 224, unit: 'mg/dL', refLow: 125, refHigh: 200, interpretation: 'HIGH' },
      { testName: 'HDL Cholesterol', valueNumeric: 42, unit: 'mg/dL', refLow: 40, refHigh: 60, interpretation: 'NORMAL' },
      { testName: 'LDL Cholesterol', valueNumeric: 148, unit: 'mg/dL', refLow: 0, refHigh: 100, interpretation: 'HIGH' },
      { testName: 'Triglycerides', valueNumeric: 170, unit: 'mg/dL', refLow: 0, refHigh: 150, interpretation: 'HIGH' },
      { testName: 'Serum Creatinine', valueNumeric: 0.95, unit: 'mg/dL', refLow: 0.70, refHigh: 1.30, interpretation: 'NORMAL' },
    ],
    medications: [
      { medicationName: 'Metformin Hydrochloride', dosage: '500 mg', frequency: 'Once daily with dinner', duration: '30 days' },
      { medicationName: 'Atorvastatin', dosage: '10 mg', frequency: 'Once daily at bedtime', duration: '30 days' },
    ]
  }
];

export async function runSeed() {
  console.log('Seed blueprint configured for MyHealthIO database initialization.');
}

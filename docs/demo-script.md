# MyHealthIO — 3-to-5 Minute Hackathon Demonstration Script

## Act 1: The Problem (0:00 - 0:45)
- **Presenter**: "Welcome everyone. When you or a loved one receive a 4-page lab report or a hospital discharge summary, what happens? Dense medical jargon, numbers with obscure units, and anxiety. In India and across the world, millions struggle to comprehend their health data or remember what tests were done 6 months ago. Moreover, language barriers deepen this divide."
- **Visual**: Show landing page with the problem statement and clear value proposition.

---

## Act 2: Document Ingestion & Traceable Extraction (0:45 - 2:00)
- **Presenter**: "Meet MyHealthIO. The user signs in and uploads a medical report—like this comprehensive metabolic panel."
- **Action**: Log in using demo credentials. Drag & drop a lab report PDF or PNG.
- **Presenter**: "Instantly, our dual PDF/OCR engine parses the document. But look closely at what sets MyHealthIO apart from generic AI wrappers: **Traceability**. For every single extracted lab value—like Fasting Blood Sugar 118 mg/dL or Total Cholesterol 224 mg/dL—we anchor directly to the exact source text snippet in the original document. If a reference range is missing or ambiguous, our system flags it with an explicit uncertainty marker rather than hallucinating."
- **Visual**: Show Report Details page with split-screen view: extracted structured cards on the left, highlighted source snippets on the right.

---

## Act 3: Clinical Safety, Grounded Summaries & Telugu Translation (2:00 - 3:15)
- **Presenter**: "Now let's examine the AI Health Copilot. Notice our strict clinical guardrails: our AI never formulates medical diagnoses or tells a patient to stop or start medicine. It provides clear, plain-language explanations of what each metric represents."
- **Action**: Click "Generate Plain-Language Summary".
- **Presenter**: "And for vernacular accessibility, with one toggle, we translate the entire explanation into clear, medical-grade Telugu—empowering families and caregivers across linguistic backgrounds."
- **Visual**: Toggle between English and Telugu summary tabs. Highlight the medical disclaimer banner.

---

## Act 4: Review, FHIR Mapping & Longitudinal Timeline (3:15 - 4:15)
- **Presenter**: "Patients remain in control. The user can review, confirm, or adjust any value. Once saved, these observations map cleanly to FHIR standards—such as FHIR Observation and DiagnosticReport—linked to a mock ABHA patient profile. Let's look at the Health Timeline."
- **Action**: Navigate to Health Timeline.
- **Presenter**: "Here is the patient's longitudinal journey: previous tests, high/normal markers over time, and prescribed medications in one chronological feed."

---

## Act 5: Impact & Wrap-up (4:15 - 5:00)
- **Presenter**: "MyHealthIO transforms passive, confusing medical paper into active, understandable, and traceable health intelligence. Thank you, and we welcome your questions!"

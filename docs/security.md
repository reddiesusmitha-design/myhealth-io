# MyHealthIO — Security & Privacy Architecture

## 1. Security Principles

Health records require the highest standard of confidentiality, integrity, and safety. MyHealthIO adheres to the following core controls:

1. **Zero Public Storage**:
   - Uploaded document files are stored in an access-restricted server directory outside the public web root.
   - Files are served exclusively through authorized streaming endpoints that verify patient ownership.
2. **Multi-Tenant Data Isolation**:
   - All queries filter strictly by `userId` extracted from cryptographically verified JWT tokens.
   - Cross-user document access triggers `403 Forbidden` / `404 Not Found` without disclosing file existence.
3. **MIME & Magic-Byte Validation**:
   - File uploads are validated at the byte header level (not relying merely on client file extensions).
   - Only `application/pdf`, `image/png`, and `image/jpeg` are accepted. Max upload size is strictly enforced (10 MB).
4. **Secret Management & Environment Segregation**:
   - API keys and database credentials reside strictly on the backend.
   - Frontend client code never contains AI keys or server secrets.
5. **Safe Logging (PHI Sanitization)**:
   - Server logs never output unencrypted patient clinical values, extracted raw text, or identity details.
   - Error traces return sanitized messages to clients.
6. **Clinical Safety Guardrails**:
   - AI outputs pass through deterministic regex and classification guardrails.
   - Prohibits hallucinating medical diagnoses or advising modifications to prescription regimens.
   - Clearly labels template vs LLM generated explanations.
   - Mandates human review for ambiguous or low-confidence OCR fields.

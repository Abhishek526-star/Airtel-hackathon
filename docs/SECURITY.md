# PROJECT UDYAM DIGITAL — SECURITY ARCHITECTURE & PRIVACY SPECIFICATION
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Platform:** Project Udyam Digital (Accel Business)  
**Compliance Standards:** DPDP Act 2023 (India), OWASP Top 10  
**Status:** Complete  

---

## 1. Compliance Alignment with India's DPDP Act, 2023

Project Udyam Digital treats user privacy and data security as foundational architectural pillars:

### 1.1 Notice & Explicit Consent (Section 6, DPDP Act 2023)
- Users are never subjected to pre-checked consent boxes or implicit data collection.
- The Smart KYC interface surfaces an explicit, plain-language consent screen before any document ingestion occurs:
  > *"By proceeding, you grant explicit consent to Accel Telecom to verify your business identity credentials against official regulatory registries (GSTIN / Udyam) strictly for telecom subscriber KYC validation and B2B GST tax invoicing."*
- Every consent action is recorded with a cryptographically reliable server timestamp (`dpdpConsentTimestamp`) and immutable audit log.

### 1.2 Purpose Limitation & Data Minimization (Section 7)
- The platform collects only the strictly necessary identifiers required for enterprise telecom activation: Legal Trade Name, GSTIN / Udyam Registration Number, Installation Address, and Technical Contact Phone.
- Aadhaar numbers and personal sensitive data are never collected in full; if present on secondary signatory proofs, only masked representations are retained.

### 1.3 Secure Document Storage & Retention Policies
- Uploaded business documents are given randomized alphanumeric hash filenames (`doc-<timestamp>-<hash>.<ext>`) to prevent direct URL enumeration or directory crawling attacks.
- Public directory browsing on the uploads directory is disabled.

---

## 2. Authentication & Authorization Security

### 2.1 Cryptographic Password Protection
- Passwords are salted and hashed using `bcryptjs` with 10 salt rounds before persistence.
- The password hash is explicitly excluded from Mongoose queries by default (`select: false`) to avoid accidental leakage into JSON responses or logs.

### 2.2 Stateless JWT Token Architecture
- Authentication uses HMAC-SHA256 signed JSON Web Tokens (JWT).
- The token payload is deliberately restricted to non-sensitive identity metadata (`userId`, `role`).
- Tokens are transmitted via the standard `Authorization: Bearer <token>` header.
- Token expiration is enforced (`7d` default in demo mode).

### 2.3 Strict Role-Based Access Control (RBAC)
- Role definitions:
  - `customer`: Can view and manage own business profile, quotes, orders, and active services.
  - `partner`: Can view assigned leads, unblock KYC exceptions, and assist with field dispatch.
  - `admin`: Has global oversight of the 5,000-lead cohort, macro conversion funnels, and executive CAC analytics.
- Middleware guards (`authenticate` and `authorize(...roles)`) are enforced on all private API endpoints.

---

## 3. Threat Mitigation Matrix (OWASP Top 10)

| Threat Vector | Potential Vulnerability | Mitigation Implemented |
| :--- | :--- | :--- |
| **NoSQL Injection** | Malicious MongoDB query operators (`$gt`, `$ne`) in JSON bodies | Strict Mongoose schema casting and parameter validation. Identifier parameters sanitized. |
| **Broken Access Control (IDOR)** | User querying another customer's quote or order ID | Controller endpoints verify ownership: `Order.findOne({ user: req.user._id, orderId })` before returning sensitive business records. |
| **Cross-Site Scripting (XSS)** | Injected JavaScript inside business trade names or addresses | React's automatic JSX text escaping; Helmet HTTP security headers (`Content-Security-Policy`, `X-XSS-Protection`). |
| **Denial of Service (DoS)** | Brute force or endpoint flooding | `express-rate-limit` enforces a ceiling of 500 requests per 15-minute window per IP. |
| **Unrestricted File Upload** | Executable scripts (.exe, .php, .js) masquerading as documents | Multer middleware checks both file extension and genuine MIME type (`image/jpeg`, `image/png`, `application/pdf`) with a strict 5MB size ceiling. |
| **Sensitive Data Exposure** | Accidental commit of API keys or secrets in source code | Centralized `.env` management with `.env.example`. Zero API keys or private credentials embedded in client bundles. |

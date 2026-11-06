# PROJECT UDYAM DIGITAL — DATA PRIVACY & SECURITY NOTE
**Airtel SYNC Hackathon 2026 · Enterprise Track A (Fictional Operator: Accel Business)**  
**Statutory Framework:** Digital Personal Data Protection (DPDP) Act, 2023 & DoT Telecom Regulations  
**Document Format:** 1-Page Official Submission Note (Deliverable #4)

---

### 1. Executive Privacy Architecture & DPDP Act 2023 Alignment

Project Udyam Digital treats MSME subscriber information with enterprise-grade data hygiene, embedding the core tenets of the **Digital Personal Data Protection Act, 2023** directly into the software architecture:

```
┌─────────────────────────┬──────────────────────────┬─────────────────────────┐
│     1. NOTICE & CONSENT  │   2. PURPOSE LIMITATION  │  3. DATA MINIMISATION   │
├─────────────────────────┼──────────────────────────┼─────────────────────────┤
│ • Pre-KYC consent modal │ • Exclusively for telecom│ • Aadhaar/PAN masking   │
│ • Clear vernacular text │   onboarding & DoT KYC   │ • Zero biometric storage│
│ • Revocable consent log │ • No third-party sharing │ • Ephemeral OCR parsing │
└─────────────────────────┴──────────────────────────┴─────────────────────────┘
```

---

### 2. Implementation of Statutory Principles

#### A. Notice & Lawful Consent (DPDP Act Section 6)
- **Pre-Collection Disclosure:** Before any document upload or registry query occurs, MSME owners are presented with an explicit, plain-language consent screen in their selected regional language (available in all 10 Indian languages).
- **Consent Artifacts:** Every consent action logs an immutable audit trail (`dpdpConsentGiven: true`, ISO-8601 timestamp, subscriber IP, and declared purpose) in MongoDB.
- **Revocation Path:** Customers can withdraw pending onboarding requests from their dashboard prior to optical provisioning.

#### B. Purpose Limitation & Proportionality (DPDP Act Section 7)
- **Restricted Processing:** Personal and business identifiers (GSTIN, Udyam registration, signatory PAN, and electricity bills) are processed **solely** for subscriber identity verification and telecom circuit provisioning under Department of Telecommunications (DoT) guidelines.
- **Zero Commercial Monetization:** Collected documents and contact details are strictly isolated from third-party advertising or non-telecom sales networks.

#### C. Data Minimisation & Identifier Masking (DPDP Act Section 8)
- **Progressive Disclosure:** Needs discovery through the AI Business Advisor requires **zero KYC documentation or PAN numbers**; only business segment, employee count, and budget are queried.
- **Client & Log Masking:** Sensitive identifiers are dynamically masked across all client interfaces and Winston/Morgan server logs:
  - Phone numbers are masked (`9810****56`).
  - GSTINs and Udyam numbers are redacted in telemetry views (`32TTN****1ZW`).
- **No Biometric Ingestion:** Physical biometric signatures are never collected; verification is conducted via automated GSTIN/Udyam cryptographic registries and licensed field partner physical overrides.

#### D. Storage Limitation, Retention & Disposal (DPDP Act Section 9)
- **Dropped Lead Expiration:** KYC documents for leads that abandon onboarding are automatically scheduled for permanent cryptographic deletion after **90 days**.
- **Activated Subscriber Compliance:** For activated circuits, billing and KYC records are archived in compliance with DoT's mandatory statutory retention schedule (2 years post-disconnection) in encrypted cold storage.

---

### 3. Technical & Operational Security Measures

1. **Cryptographic Protection:**
   - **In Transit:** Mandatory TLS 1.3 / HTTPS across all API routes, rejecting legacy SSL ciphers.
   - **At Rest:** MongoDB database encryption and AES-256 encryption on uploaded documents.
2. **Access Control & RBAC:**
   - Stateless JWT tokens with strict 7-day expiration and role-based middleware (`customer`, `partner`, `admin`).
   - Field sales partners only access leads geographically assigned within their specific telecom circle.
3. **Planted Defect Resiliency & Fraud Mitigation:**
   - Automated detection of expired utility bills (>90 days from the benchmark date `2026-07-15`), cancelled GSTINs, and signatory name mismatches to prevent fraudulent subscriber provisioning.


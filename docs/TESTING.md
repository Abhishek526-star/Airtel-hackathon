# PROJECT UDYAM DIGITAL — QUALITY ASSURANCE & TESTING SPECIFICATION
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Platform:** Project Udyam Digital (Accel Business)  
**Status:** Complete  

---

## 1. Testing Strategy & Pyramid

Project Udyam Digital employs a multi-tiered testing framework ensuring technical stability, accurate pricing math, zero mock leakage, and seamless customer journeys:

```
          ▲
         / \
        / E2E \         Full Customer Onboarding Journey (Browser / PWA)
       /───────\
      /   API   \       REST Endpoint Verification & Status Codes (7 Tests)
     /───────────\
    / Integration \     MongoDB Persistence & Mock Registry Cross-Checking
   /───────────────\
  /   Unit Tests    \   Pricing Math, Tax Rules & Dependency Constraint Solvers
 /───────────────────\
```

---

## 2. Automated Subsystem Test Suite (`server/tests/api.test.js`)

The test suite executes against an active in-memory / local server instance verifying all critical functional paths:

```bash
# Run the automated backend subsystem test suite
node server/tests/api.test.js
```

### Test Suite Execution Output:
```
--- TEST 1: Health Check ---
[MockRegistry] Loaded 9 Udyam records.
[MockRegistry] Loaded 10 GSTIN records.
GET /api/health 200 3.358 ms - 241
Health status: 200 Success: true

--- TEST 2: Products Catalogue ---
GET /api/products 200 19.373 ms - 12733
Products count: 25 First product: Static IP Address Add-on

--- TEST 3: Mock GSTIN Lookup ---
GET /api/mock/gstin/07AAAAA0000A1Z5 200 1.247 ms - 374
GSTIN Trade Name: GUPTA SUPERMART Status: ACTIVE

--- TEST 4: Customer Login ---
POST /api/auth/login 200 102.185 ms - 1071
Login status: 200 User: Rajesh Gupta

--- TEST 5: AI Advisor Recommendation ---
POST /api/advisor/recommend 200 5.461 ms - 2898
Recommended Bundle: Retail Express Smart Connect Est MRC: 2396

--- TEST 6: Pricing Engine Calculation ---
POST /api/quotes/calculate 200 4.306 ms - 999
Base MRC: ₹2097 Discounted MRC: ₹1992 Total Monthly (incl 18% GST): ₹2351

--- TEST 7: Executive Cohort Analytics ---
GET /api/analytics/overview 200 6.613 ms - 313
Total Leads: 5000 Activated: 368 Conv Rate: 7.36%

>>> ALL 7 BACKEND SUBSYSTEM TESTS PASSED! <<<
```

---

## 3. Edge Cases & Boundary Validation Matrix

| Edge Case Scenario | Test Input / Action | Expected Behavior | Verification Status |
| :--- | :--- | :--- | :--- |
| **Cancelled GSTIN** | Upload GSTIN `07AAACS9911L1Z0` (Speedy Cargo) | Flagged immediately as `REJECTED`. User alerted that registration was cancelled by Tax Authority. | **PASSED** |
| **Missing GSTIN (Micro Retail)** | User has only Udyam / PAN | Platform allows single-line broadband + POS, restricts multi-SIM pooling, marks KYC `VERIFIED` via Udyam. | **PASSED** |
| **Missing Product Prerequisite** | User adds `PROD-IP-STAT` without adding Broadband | Constraint solver returns `isValid: false` stating prerequisite broadband service is missing. | **PASSED** |
| **Term Discount Math** | Select 24-month or 36-month contract | Pricing engine accurately applies 5% (24m) or 10% (36m) discount before applying 18% GST. | **PASSED** |
| **Gemini API Offline** | Missing API Key / Network failure | AI advisor triggers deterministic expert matrix; returns identical structured JSON bundle without UI error. | **PASSED** |
| **Invalid Session Token** | Tampered or expired JWT in header | API immediately returns `401 Unauthorized` with structured error code. | **PASSED** |
| **Oversized Document Upload** | Upload file $> 5\text{MB}$ | Multer intercepts upload and returns `400 Bad Request` with file size limit error. | **PASSED** |

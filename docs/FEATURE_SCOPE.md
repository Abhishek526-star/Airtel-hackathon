# PROJECT UDYAM DIGITAL — FEATURE SCOPE & PRIORITIZATION MATRIX
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Platform:** Project Udyam Digital (Accel Business)  
**Document Status:** Complete (Phase 0 Baseline)  

---

## 1. Feature Priority Overview

To guarantee delivery of a battle-tested, high-impact hackathon prototype, features are classified according to the standard MoSCoW prioritization framework:
- **P0 (Mandatory / Must Have):** Core self-service onboarding flow required to fulfill the "Go Digital in One Sitting" promise. Non-negotiable for demonstration.
- **P1 (Important / Should Have):** Administrative oversight, role-based security, unified post-activation dashboard, and executive analytics.
- **P2 (Stretch / Could Have):** Advanced automation, omnichannel communications, and AI voice assistance.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FEATURE PRIORITY MATRIX                         │
├──────────────┬──────────────────────────────────────────┬──────────────┤
│ Priority     │ Functional Domains                       │ Target Phase │
├──────────────┼──────────────────────────────────────────┼──────────────┤
│ P0 Mandatory │ • Interactive AI Business Advisor        │ Phase 4, 5,  │
│              │ • 25-Product Catalogue & Rules           │ Phase 6, 7,  │
│              │ • Dynamic Quote Builder & Pricing Engine │ Phase 8      │
│              │ • Checkout & Simulated Order Flow        │              │
│              │ • Smart KYC with OCR & Mock Registries   │              │
│              │ • Visual Order Lifecycle Tracker         │              │
│              │ • Mobile-First Fluid UI (Airtel Red)     │              │
├──────────────┼──────────────────────────────────────────┼──────────────┤
│ P1 Important │ • JWT Auth & Role-Based Access Control   │ Phase 3, 9,  │
│              │ • Business Profile Management            │ Phase 10     │
│              │ • Customer Self-Care Dashboard           │              │
│              │ • Sales Partner Assisted Lead Dashboard  │              │
│              │ • Executive Admin & Cohort Analytics     │              │
│              │ • Seed Data & 5,000 Lead Analysis        │              │
├──────────────┼──────────────────────────────────────────┼──────────────┤
│ P2 Stretch   │ • Multilingual Voice Chat / Speech-to-Tx│ Phase 5+,    │
│              │ • WhatsApp Business Webhook Simulation   │ Phase 9+,    │
│              │ • ML Lead Propensity Scoring Heuristic   │ Phase 10+    │
│              │ • Real-time WebSockets / SSE Updates     │              │
└──────────────┴──────────────────────────────────────────┴──────────────┘
```

---

## 2. Detailed Scope Breakdown by Module

### 2.1 P0 — Mandatory Features (Must Have)

| Module | Feature Code | Feature Name & Scope | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **Product Catalogue** | **P0-CAT-01** | **25-Product Master Dataset** | Complete dataset seeded across Broadband, Voice, Cloud, Security, IoT. Accurate pricing, setup fees, contract terms, city tier eligibility, and GSTIN mandates. |
| **Product Catalogue** | **P0-CAT-02** | **Category & Eligibility Filters** | Filter by category, Tier 1/2/3 availability, and GSTIN requirement. Strict dependency validation (e.g. Static IP requires Broadband). |
| **AI Advisor** | **P0-ADV-01** | **Dynamic Conversational Consultation** | Adaptive questionnaire (4–6 non-redundant questions) assessing business type, staff count, branches, payment method, and budget. |
| **AI Advisor** | **P0-ADV-02** | **Hybrid Recommendation Engine** | Algorithmic catalogue filtering combined with Gemini LLM (or deterministic fallback) providing plain-language justifications in English & Hindi. |
| **AI Advisor** | **P0-ADV-03** | **One-Click Add to Quote** | Direct handoff from recommended bundle card into the interactive quote builder. |
| **Quote & Pricing** | **P0-QTE-01** | **Interactive Bundle Customizer** | Add/remove add-ons (extra SIMs, static IP, cloud backup), toggle contract duration (12/24/36 mo) with real-time UI updates. |
| **Quote & Pricing** | **P0-QTE-02** | **Server-Authoritative Pricing Engine** | Backend calculates exact Setup Fees, MRC, Volume Discounts, and 18% GST. Frontend never calculates final price alone. |
| **Checkout** | **P0-CHK-01** | **Order Submission & Simulation** | Installation address capture, technical contact, preferred slot selection, simulated payment confirmation, and Order ID creation. |
| **Smart KYC** | **P0-KYC-01** | **Digital Consent Protocol** | Explicit DPDP 2023 compliant consent screen with purpose specification, timestamping, and audit log. |
| **Smart KYC** | **P0-KYC-02** | **Multi-format Document Upload** | Upload GST Certificate, Udyam Certificate, or Shop License (PDF, PNG, JPG $\le 5\text{MB}$). |
| **Smart KYC** | **P0-KYC-03** | **OCR Extraction & Text Parsing** | Automatic extraction of Legal Business Name, Registration Number, State, and Signatory Name. |
| **Smart KYC** | **P0-KYC-04** | **Mock GSTIN & Udyam Validation** | Fast in-memory lookup against `mock_gstin_registry.csv` and `mock_udyam_registry.csv`. Instant status detection: ACTIVE, CANCELLED, SUSPENDED. |
| **Order Tracker** | **P0-TRK-01** | **Visual Lifecycle Timeline** | Stepper showing: Order Placed → KYC Verified → Field Engineer Assigned → Activation Live. |
| **UI System** | **P0-UI-01** | **Airtel-Inspired Enterprise Design** | Airtel Red (#E31E24) and Dark Slate (#111827) design system with 100% mobile-friendly responsive layout. |

---

### 2.2 P1 — Important Features (Should Have)

| Module | Feature Code | Feature Name & Scope | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **Auth & Security** | **P1-AUT-01** | **JWT Authentication & RBAC** | Support for Customer, Sales Partner, and Admin roles. Bcrypt password hashing. Protected routes and token refresh/invalidation. |
| **Profile** | **P1-PRF-01** | **Persistent Business Profile** | Store business demographic, tax identifiers, branch details, and current ISP details for reuse across journeys. |
| **Customer Portal** | **P1-DSH-01** | **Customer Self-Care Dashboard** | Summary of active subscriptions, bandwidth health gauge, SLA status, and billing breakdown. |
| **Customer Portal** | **P1-DSH-02** | **Consolidated Digital B2B Invoice** | Monthly billing invoice with itemized charges, GST tax details, and simulated PDF download. |
| **Sales Partner** | **P1-PRT-01** | **Partner Lead Management** | View assigned leads, filter by KYC failures and abandoned quotes, and schedule installation visits. |
| **Sales Partner** | **P1-PRT-02** | **Partner KYC Assistance** | Sales executive manual review and assisted document resubmission for edge-case KYC failures. |
| **Executive Admin** | **P1-ADM-01** | **Cohort Analytics Dashboard** | Full visualization of the 5,000-lead case study cohort: conversion rates, drop-off stages, CAC metrics, and segment trends using Recharts. |

---

### 2.3 P2 — Stretch Goals (Could Have)

| Module | Feature Code | Feature Name & Scope | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **Omnichannel** | **P2-STR-01** | **WhatsApp Notification Simulation** | In-app visual preview of automated WhatsApp business messages sent to the customer upon quote lock, KYC pass, and activation. |
| **AI Experience** | **P2-STR-02** | **Multilingual Voice Assistance** | Web Speech API speech-to-text input for Hindi/English conversational questions. |
| **Lead Intelligence**| **P2-STR-03** | **Heuristic Lead Propensity Scoring** | Explainable 0–100 propensity score derived from GSTIN status, employee headcount, and quote response time. |

---

## 3. Explicitly Out-of-Scope (Non-Goals)

To prevent scope creep and ensure compliance with hackathon regulations:
1. **Live Telco BSS/OSS Integration:** The prototype interacts with mock Accel Business provisioning adapters, never live telecom switches or production Airtel APIs.
2. **Real Payment Gateway Settlement:** All transactions use simulated payment confirmation; no real payment card or UPI gateway is integrated.
3. **Live Government GST/Udyam API Integration:** Real API integration with the Ministry of Corporate Affairs or GSTN portal is replaced with high-fidelity mock services utilizing `mock_gstin_registry.csv` and `mock_udyam_registry.csv`.


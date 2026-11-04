# PROJECT UDYAM DIGITAL — SYSTEM ARCHITECTURE SPECIFICATION
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Platform:** Project Udyam Digital (Accel Business)  
**Architecture Paradigm:** Modular Monolith (Client-Server RESTful Model)  
**Document Status:** Complete (Phase 1 Baseline)  

---

## 1. High-Level Architectural Overview

Project Udyam Digital is built as a cloud-ready, responsive, modular web platform designed for MSME self-service on mobile devices while granting enterprise-grade orchestration to sales partners and administrators.

```
┌────────────────────────────────────────────────────────────────────────┐
│               PROJECT UDYAM DIGITAL — TIERED ARCHITECTURE              │
├────────────────────────────────────────────────────────────────────────┤
│ 1. CLIENT TIER (Single Page Application — React 18/19 + Vite)          │
│    • Tailwind CSS Enterprise Design System (Airtel SYNC Red Palette)   │
│    • React Router v6 with Role-Based Route Guards                      │
│    • Domain Contexts: AuthContext, QuoteContext, AdvisorContext        │
│    • Recharts Data Visualizations & Lucide Icons                       │
│    • Responsive Mobile-First Ergonomic UI                              │
├──────────────────────────────────┬─────────────────────────────────────┤
│                                  │ HTTP / HTTPS (RESTful JSON + JWT)   │
│                                  ▼                                     │
├────────────────────────────────────────────────────────────────────────┤
│ 2. APPLICATION TIER (Node.js LTS + Express.js Modular Monolith)        │
│    • Centralized Error & Exception Handler                             │
│    • Express Rate Limiter, Helmet Security Headers & CORS Guard        │
│    • Multer Secure Multipart Document Ingestion Filter                 │
│    • Authentication & RBAC Middleware (`verifyToken`, `requireRole`)   │
│                                                                        │
│    Modular Domain Services:                                            │
│    ├── AuthService (JWT + Bcrypt)                                      │
│    ├── BusinessProfileService                                          │
│    ├── CatalogueService (25 Products, Dependency & Tier Solver)       │
│    ├── AIAdvisorService (Google Gemini API + Deterministic Fallback)   │
│    ├── PricingEngine (Setup fees, MRC, Tier discounts, 18% GST)        │
│    ├── SmartKYCService (Tesseract OCR + Regex + Verification Rules)    │
│    ├── MockRegistryService (Fast In-Memory GSTIN & Udyam CSV lookup)   │
│    ├── OrderService (State Machine Lifecycle Engine)                   │
│    ├── PartnerService (Assisted Onboarding, Lead Management)          │
│    └── AnalyticsService (5,000 Cohort Metrics, Funnels, CAC Engine)    │
├──────────────────────────────────┬─────────────────────────────────────┤
│                                  │ Mongoose ODM Driver (TCP 27017)     │
│                                  ▼                                     │
├────────────────────────────────────────────────────────────────────────┤
│ 3. PERSISTENCE & STORAGE TIER                                          │
│    • MongoDB Document Database:                                        │
│      - `users`, `profiles`, `products`, `quotes`, `kycdocuments`,      │
│      - `orders`, `notifications`, `leads`                              │
│    • Secure Document Storage: Local Disk / Encrypted Hash Storage      │
│    • Master Synthetic Datasets (`data/*.csv`)                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystem Modules

### 2.1 Authentication and Authorization Module
- **Responsibilities:** User registration, password encryption via bcrypt (10 rounds), token issuance (`accessToken` signed with HMAC-SHA256), and role assignment (`customer`, `partner`, `admin`).
- **Security Protocols:** JWT payload contains minimal non-sensitive identity attributes (`userId`, `email`, `role`). Middleware `authenticate` validates signature; `authorize(roles)` blocks unauthorized route traversal.

### 2.2 Business Profile Management Module
- **Responsibilities:** Captures enterprise identity (Legal Name, Trade Name, Industry, Segment, Staff count, City Tier, PIN code, existing broadband provider).
- **Persistence:** Bound 1-to-1 to the customer entity. Pre-populates AI advisor prompts, quote documents, and KYC forms to eliminate redundant typing.

### 2.3 Product Catalogue & Constraint Solver Module
- **Responsibilities:** Serves the 25 official products from `product_catalogue.csv`.
- **Constraint Solver Engine:** Evaluates feasibility matrix:
  - *City Tier Check:* Restricts Gigabit Fiber or SD-WAN if business is located in Tier 3.
  - *GSTIN Requirement:* Disallows corporate multi-SIM pooling if GSTIN is absent.
  - *Dependency Solver:* If user adds `PROD-IP-STAT` (Static IP), ensures at least one broadband product is in the cart.

### 2.4 AI Business Advisor Module
- **Responsibilities:** Interactive questionnaire and intelligent bundle recommendation.
- **Hybrid AI Strategy:**
  1. *Rule-Based Filtering:* Prunes the 25 products to 3–5 eligible items matching budget, headcount, and sector.
  2. *LLM Synthesis (Gemini API):* Formulates natural, conversational business advice explaining *why* this bundle protects operations and drives revenue.
  3. *Zero-Failure Deterministic Fallback:* If offline or API key missing, executes a heuristic matrix yielding identical structured JSON recommendations.

### 2.5 Quote and Pricing Engine Module
- **Responsibilities:** Server-authoritative computation of:
  - Monthly Recurring Charges (MRC)
  - One-time Setup & Installation Fees
  - Contract duration discounts (e.g., 5% off MRC on 24-month commit, 10% on 36-month)
  - Mandatory 18% Goods & Services Tax (GST)
  - Total One-Time Initial Payable vs. Recurring Monthly Bill
- **Immutability:** Generates a locked Quote with unique `quoteId` and expiration timestamp.

### 2.6 Smart KYC & Document Verification Module
- **Responsibilities:** DPDP Act 2023 compliant consent capture, secure file upload, OCR extraction, and mock registry cross-referencing.
- **State Progression:**
  `NOT_STARTED` $\to$ `CONSENT_PENDING` $\to$ `DOCUMENTS_PENDING` $\to$ `PROCESSING` $\to$ `VERIFIED` | `NEEDS_REVIEW` | `REJECTED`.

### 2.7 Order Lifecycle State Machine Module
- **Enforced Transitions:**
  - `ORDER_PLACED` $\to$ `KYC_PENDING`
  - `KYC_PENDING` $\to$ `KYC_VERIFIED`
  - `KYC_VERIFIED` $\to$ `INSTALLATION_SCHEDULED`
  - `INSTALLATION_SCHEDULED` $\to$ `INSTALLATION_IN_PROGRESS`
  - `INSTALLATION_IN_PROGRESS` $\to$ `ACTIVATED`
- **Validation Guard:** Prevents skipping stages (e.g. cannot activate before KYC verification).

### 2.8 Customer, Partner & Admin Dashboards
- **Customer Dashboard:** Real-time SLA monitoring, active service cards, monthly billing PDF invoice simulator.
- **Sales Partner Dashboard:** Queue of assigned leads, abandoned quote reminders, assisted document re-upload.
- **Admin & Analytics Dashboard:** Visual metrics on 5,000-lead cohort, conversion funnel, CAC comparison, and MRR.

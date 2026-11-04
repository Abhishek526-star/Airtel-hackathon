# PROJECT UDYAM DIGITAL — BUSINESS & SYSTEM REQUIREMENTS SPECIFICATION
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Initiative:** Project Udyam Digital — Making Small Businesses Go Digital in One Sitting  
**Telecom Operator Context:** Accel Telecom / Accel Business (Fictional Enterprise Division)  
**Document Status:** Complete (Phase 0 Baseline)  

---

## 1. Executive Summary & Business Context

In India, Micro, Small, and Medium Enterprises (MSMEs) represent the backbone of economic activity, accounting for over 30% of GDP and driving employment for over 110 million individuals. However, commercial digital enablement for this sector remains fragmented, manual, and friction-laden.

Accel Business currently suffers from an antiquated, human-dependent sales and provisioning pipeline:
- **Lead to Activation Turnaround Time:** 10–14 days (case study baseline: 17.6 days average).
- **Manual Quotation Friction:** Sales engineers take 3–5 days to manually calculate multi-product quotes and verify eligibility.
- **KYC Paperwork Bottlenecks:** Physical document collection, paper signatures, and physical courier cycles lead to massive drop-offs.
- **Conversion Disparity:** Out of 5,000 quarterly leads, only 368 activate (a dismal 7.36% conversion rate). Leads possessing verified GSTIN activate at 9.6%, whereas leads lacking GSTIN collapse to 2.0%.
- **High Blended Customer Acquisition Cost (CAC):** Reaching ₹15,000 per activated business customer due to multiple on-site agent visits and 3+ follow-up calls per lead.
- **Disparate Product Silos:** Broadband (FTTH/Leased Line), Corporate SIMs, Cloud PBX/WhatsApp Business, Cybersecurity, and Office Tools operate on separate billing engines and disjointed customer portals.

**Project Udyam Digital** directly solves this by delivering an end-to-end, digital-first self-service platform designed specifically for smartphone-first MSME owners, while seamlessly empowering Accel's sales partners and field executives for hybrid assisted selling.

---

## 2. Customer Segmentation & Target Personas

Based on the empirical distribution from Accel's 5,000-lead case study cohort, the target market is categorized into four distinct customer segments:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MSME Market Distribution                        │
├────────────────────────────────┬───────────────────────────────────────┤
│ Segment                        │ Share (%) & Strategic Focus           │
├────────────────────────────────┼───────────────────────────────────────┤
│ 1. Micro Retail & Services     │ 55% — P0 Priority (Kirana, Pharmacy,  │
│                                │      Salon, Apparel, Eateries)        │
│ 2. Professional Offices        │ 25% — P0 Priority (Law, CA, Clinic,   │
│                                │      Consultancies, Design Studios)   │
│ 3. Small Multi-site Businesses │ 15% — Extensible (Retail Chains,      │
│                                │      Diagnostic Centers, Warehouses)  │
│ 4. Small Manufacturers         │ 5%  — Extensible (Auto Ancillary,     │
│                                │      Textile units, Packaging units)  │
└────────────────────────────────┴───────────────────────────────────────┘
```

### Persona 1: Rajesh Gupta — Micro Retail Owner (P0 Primary)
- **Profile:** 42 years old, proprietor of "Gupta Supermart" (Kirana & FMCG), Sector 18, Noida. Employs 3 staff.
- **Current Setup:** Residential FTTH connection with frequent buffering during peak hours; personal prepaid SIM used for customer calls and supplier WhatsApp; consumer QR code standee; no formal cybersecurity or backup.
- **Pain Points:** Cash counter POS freezes during UPI surges; loses orders when personal phone battery dies; cannot afford dedicated IT staff; fears complicated enterprise telecom contracts with hidden setup fees.
- **Needs:** Plug-and-play business broadband with static IP or 99.5% uptime SLA, dual-SIM commercial voice lines, official WhatsApp Business API for automated grocery delivery receipts, and zero upfront friction.
- **Digital Affinity:** Smartphone-native, uses WhatsApp and PhonePe daily, prefers Hindi or conversational English, completes paperwork only if instant via Aadhaar/GST/Udyam.

### Persona 2: Adv. Sneha Sen Sharma — Professional Office Partner (P0 Primary)
- **Profile:** 34 years old, Managing Partner at "Sen & Associates Legal Consultancy", Connaught Place, New Delhi. 8 associates and 2 paralegals.
- **Current Setup:** Shared office Wi-Fi, personal laptops, individual mobile plans with unmetered personal reimbursement.
- **Pain Points:** Client confidential briefs stored in unencrypted Google Drive; no central professional voice reception (clients calling personal mobile phones after hours); billing invoices fragmented across three different telecom operators.
- **Needs:** High-speed Fiber Broadband with secure DNS, Virtual Cloud PBX (one central landline number hunting to associate SIMs), secure cloud collaboration bundle (email + 1TB encrypted storage), GST-compliant single consolidated bill for corporate tax write-off.
- **Digital Affinity:** Desktop and mobile proficient, values speed, transparent SLAs, downloadable quotes, and clean digital invoicing.

### Persona 3: Vikram Deshmukh — Small Multi-Site Logistics Manager (Extensible)
- **Profile:** 48 years old, Founder of "Deccan Express Couriers" operating 1 central hub in Pune and 3 branch booking offices.
- **Needs:** Inter-branch SD-WAN / leased broadband, IoT asset tracking SIMs, unified customer support number, and centralized dashboard monitoring bandwidth and bill status across 4 sites.

### Persona 4: Harpreet Singh — Light Engineering Workshop (Extensible)
- **Profile:** 52 years old, Proprietor of "Guru Nanak Tooling Works", Ludhiana Industrial Area.
- **Needs:** Industrial IoT monitoring SIMs, ruggedized broadband, cloud backup for CAD drawings, and strict GST-linked corporate invoicing.

---

## 3. High-Level Business Requirements (BR)

- **BR-1: One-Sitting Digital Onboarding:** A business owner must be able to discover products, answer 4–6 dynamic questions, receive tailored bundle recommendations, customize their quote, complete smart KYC, and place an order within a single 10-minute session on mobile or web.
- **BR-2: 100% Catalogue & Pricing Integrity:** Pricing and product eligibility must strictly mirror the official 25-product catalogue. No fabricated discounts, phantom product codes, or inaccurate tier restrictions are permitted.
- **BR-3: Automated Smart KYC Verification:** Replace physical document dispatch with instant digital document processing (OCR extraction + Mock GSTIN / Udyam registries validation), delivering real-time status transitions.
- **BR-4: Real-Time Transparent Lifecycle Tracking:** Eliminate status follow-up calls by giving every customer a real-time order tracker showing clear milestones: Order Placed → KYC Verified → Installation Scheduled → Activation Live.
- **BR-5: Unified Post-Activation Management:** Deliver a single pane of glass for active services, bandwidth metrics, monthly billing breakdown, and digital support tickets.
- **BR-6: Sales Partner Co-Pilot & Field Enablement:** Allow Accel Business channel partners and sales executives to view abandoned quotes, assist customers with failed KYC uploads, and schedule on-ground installations.
- **BR-7: Evidence-Based Executive Analytics:** Provide leadership with live funnel conversion metrics, CAC tracking, drop-off root-cause analysis, and revenue modeling based on the 5,000-lead case study cohort.

---

## 4. Functional Requirements (FR)

### Module 1: Authentication, Authorization & Profile Management
- **FR-1.1:** Secure user registration with mobile number, email, and password.
- **FR-1.2:** Role-based access control (RBAC) supporting `customer`, `partner`, and `admin`.
- **FR-1.3:** JWT authentication with secure http-only session tokens or bearer headers and bcrypt password hashing (minimum 10 salt rounds).
- **FR-1.4:** Reusable business profile capturing Business Legal Name, Trade Name, Industry, Segment, Employee Count, City Tier, PIN code, and existing telecom infrastructure.

### Module 2: Product Catalogue & Bundling Engine
- **FR-2.1:** Database-backed catalogue populated from the 25 official products across Broadband, Voice/Mobile, Cloud/Collaboration, Security, and IoT/Specialized services.
- **FR-2.2:** Multi-attribute filtering (Category, City Tier availability, GSTIN requirement, Setup fee, Contract duration).
- **FR-2.3:** Strict dependency enforcement (e.g., Static IP requires Business Broadband; Cloud PBX requires minimum 2 Voice SIMs).

### Module 3: AI Business Advisor (Conversational & Hybrid)
- **FR-3.1:** Interactive conversational assistant asking targeted, non-redundant operational questions (Business Type, Staff, Locations, Payment processing, Budget).
- **FR-3.2:** Hybrid recommendation engine coupling strict catalogue eligibility rules with an LLM (Gemini API with robust rule-based fallback) to generate human-readable, contextual justifications.
- **FR-3.3:** Multilingual capability (English & Hindi) with extensibility for regional languages (Tamil, Telugu, Marathi).
- **FR-3.4:** Instant "Add to Quote" action directly transitioning recommended bundles into the quote builder.

### Module 4: Dynamic Quote & Checkout Engine
- **FR-4.1:** Interactive visual quote builder permitting addition/removal of optional products, quantity scaling, and contract duration selection (12, 24, 36 months).
- **FR-4.2:** Server-authoritative pricing engine calculating Setup Fees, Base Monthly Recurring Charges (MRC), Volume Discounter rules, GST (18%), and Total Payable.
- **FR-4.3:** Checkout flow capturing service installation address, technical contact, preferred installation slot, and simulated payment confirmation.

### Module 5: Smart Digital KYC & Document Verification
- **FR-5.1:** DPDP Act 2023 compliant digital consent capture with explicit purpose specification and timestamping.
- **FR-5.2:** Secure multipart document upload supporting GST Certificate, Udyam Certificate, Authorized Signatory Aadhaar/PAN, and Utility Bill (PDF/JPG/PNG up to 5MB).
- **FR-5.3:** Client-side / Server-side OCR engine extracting Legal Name, Registration Number, Address, and Signatory Name.
- **FR-5.4:** Mock Government Registry validation comparing extracted data against `mock_gstin_registry.csv` and `mock_udyam_registry.csv`.
- **FR-5.5:** Deterministic status machine: `NOT_STARTED` → `CONSENT_PENDING` → `DOCUMENTS_PENDING` → `PROCESSING` → `VERIFIED` | `NEEDS_REVIEW` | `REJECTED`.

### Module 6: Order Lifecycle & Visual Tracker
- **FR-6.1:** Order state machine enforcing legitimate sequential transitions: `ORDER_PLACED` → `KYC_PENDING` → `KYC_VERIFIED` → `INSTALLATION_SCHEDULED` → `INSTALLATION_IN_PROGRESS` → `ACTIVATED`.
- **FR-6.2:** Real-time visual progress stepper with estimated completion time, field engineer assignment details, and instant support contact.
- **FR-6.3:** In-app notification center for automated status triggers.

### Module 7: Unified Customer Dashboard
- **FR-7.1:** Overview of active services, SLA health (e.g., 99.8% uptime), and bandwidth consumption gauges.
- **FR-7.2:** Consolidated digital monthly billing statement with downloadable PDF preview.
- **FR-7.3:** Support ticket creation and quick service add-on requests.

### Module 8: Sales Partner & Executive Admin Dashboard
- **FR-8.1:** Channel partner view with lead pipeline, abandoned quote recovery, KYC failure resolution, and assisted onboarding initiation.
- **FR-8.2:** Executive analytics dashboard powered by the 5,000-lead cohort with conversion funnels, CAC metrics, city-tier performance, and churn projections.
- **FR-8.3:** Lead propensity scoring (rule-based heuristic calculating conversion likelihood based on GSTIN, employee count, and digital readiness).

---

## 5. Non-Functional Requirements (NFR)

- **NFR-1: Performance & Latency:**
  - Standard REST API response time $\le 200\text{ ms}$ (95th percentile).
  - AI Advisor initial bundle generation $\le 2.5\text{ s}$ (with streaming typing indicators).
  - OCR extraction & Registry match turnaround $\le 3\text{ s}$.
- **NFR-2: Mobile-First Responsiveness:**
  - 100% responsive fluid UI across mobile viewports (360px–420px), tablet (768px), and desktop (1024px–1920px).
  - Touch-friendly tap targets ($\ge 44 \times 44\text{ px}$) and ergonomic bottom navigation for mobile users.
- **NFR-3: Data Privacy & Security (DPDP Act 2023 Alignment):**
  - Document files stored with randomized hash keys, never exposed via public directory browsing.
  - PII (Aadhaar, PAN, Phone) masked in logs and client state where not strictly needed.
  - Zero sensitive secrets or API tokens committed in source control or exposed to the browser client.
- **NFR-4: High Reliability & Graceful Degradation:**
  - Complete operational independence from third-party LLM uptime: if the Gemini API key is missing or rate-limited, the system seamlessly activates the deterministic rule-based recommendation fallback without UI crashes.
  - Mock registry services remain fast, local, and idempotent.

---

## 6. External Service Dependencies & Architecture Interfacing

| Service Category | Primary Provider / Library | Local Fallback / Mock Strategy |
| :--- | :--- | :--- |
| **Database** | MongoDB Atlas / Local MongoDB (Port 27017) | Mongoose schema with in-memory or local persistence |
| **AI LLM Engine** | Google Gemini API (`@google/genai` or REST) | Built-in Rule-Based Recommendation Expert Matrix |
| **OCR Engine** | Tesseract.js / Regex Extractor | Deterministic Regex & Mock Metadata Extractor |
| **Govt Registries** | Mock GSTIN & Udyam Registries | In-memory CSV lookup service (`data/mock_*.csv`) |
| **Object Storage** | Cloudinary / Local Multer Secure Disk | Controlled `/api/uploads/documents/` authenticated route |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) + `bcrypt` | Standard cryptographic bearer token header |

---

## 7. Compliance, Security & Ethical Boundaries

1. **Airtel / Accel Branding Boundary:** The platform adopts the red/dark-slate visual identity inspired by Airtel SYNC Hackathon 2026, while explicitly stating: *"Accel Business Prototype — Demonstration for Airtel SYNC Hackathon 2026. Not connected to live production Airtel telecom networks."*
2. **DPDP Compliance Notice:** Users are presented with clear, granular consent checkmarks informing them that their GST and Udyam details are utilized exclusively for mock telecom KYC validation.
3. **No Financial Risk:** All checkout and payment triggers are clearly marked as *"Simulated Digital Checkout (Hackathon Demo Mode)"*. No real credit card or bank credentials are collected or stored.

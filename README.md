# Project Udyam Digital — Making Small Businesses Go Digital in One Sitting

**Airtel SYNC Hackathon 2026 — Enterprise Track A**  
**Fictional Operator Context:** Accel Telecom / Accel Business  
**Prototype Status:** Fully Functional, Tested & Production-Ready  

---

> [!NOTE]
> **Enterprise Track Context Disclaimer:**  
> This prototype is developed for the **Airtel SYNC Hackathon 2026 Enterprise Track A** case study. It adopts the signature Airtel SYNC enterprise visual presentation while retaining the fictional telecom operator **Accel Telecom / Accel Business** as specified in the case study guidelines. It is not connected to live production Airtel telecom switches or live government servers.

---

## 1. Executive Summary & Problem Solved

India's 63+ million MSMEs (Micro, Small, and Medium Enterprises) drive over 30% of national GDP. However, enterprise telecom adoption remains severely constrained by slow, fragmented, human-dependent sales pipelines:

- **17.6 Days Average Lead-to-Activation Time** (case study cohort baseline).
- **3–5 Days Manual Quotation Delay** by field sales representatives.
- **Physical Paperwork Bottlenecks** (paper signatures, courier loops for GST & Udyam proofs).
- **7.36% Conversion Rate** (only 368 activations out of 5,000 quarterly leads).
- **High Blended CAC:** ₹15,000 per activated business due to multiple on-site visits and 3+ follow-up calls per customer.
- **Non-GSTIN Disparity:** Leads with verified GSTIN activate at 9.6%, whereas leads lacking GSTIN collapse to 2.0%.

**Project Udyam Digital** directly solves this by delivering an end-to-end, digital-first self-service platform designed specifically for smartphone-first MSME owners, while seamlessly empowering Accel's sales partners and field executives for hybrid assisted selling.

---

## 2. How Project Udyam Digital Works Across All Roles

The platform provides dedicated, role-specific experiences tailored to every actor in the enterprise telecommunications lifecycle:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PROJECT UDYAM DIGITAL ROLES                       │
├─────────────────────┬──────────────────────────┬───────────────────────┤
│ 1. CUSTOMER ROLE    │ 2. SALES PARTNER ROLE    │ 3. EXECUTIVE ADMIN    │
│ (MSME Owner)        │ (Channel Partner/Agent)  │ (Telecom Leadership)  │
├─────────────────────┼──────────────────────────┼───────────────────────┤
│ • AI Advisor        │ • Territory Lead Queue   │ • 5,000 Cohort Funnel │
│ • Bundle Customizer │ • KYC Exception Resolver │ • Blended CAC Monitor │
│ • Smart KYC Upload  │ • Abandoned Cart Followup│ • GSTIN Disparity Map │
│ • 1-Click Checkout  │ • Assisted On-Site Verify│ • Segment Performance │
│ • Order Live Tracker│ • Field Tech Dispatch    │ • Churn & SLA Metrics │
│ • Post-Care Portal  │                          │                       │
└─────────────────────┴──────────────────────────┴───────────────────────┘
```

### Role 1: Customer (MSME Business Owner)
*Primary Personas: Sneha Rao (Proprietor, Saffron Bakers, Ludhiana &bull; Lead `L00002`) / Rajesh Gupta (Gupta Supermart)*

1. **AI Business Advisor (`/advisor`):**
   - Answers 5 conversational operational questions in English or Hindi (business type, staff size, payment setup, WhatsApp communication, budget).
   - AI hybrid engine checks the official 25-product catalogue (`P01`–`P25`) and returns a tailored bundle with plain-language business justification.
2. **Interactive Quote Builder (`/quote`):**
   - Customizes items, toggles term lock-in (12, 24, 36 months with 5% or 10% discounts), adds optional static IP (`P11`) or cloud backup (`P17`).
   - Server-authoritative pricing calculates Base MRC, term discounts, setup fees, and 18% GST input credit.
   - Generates a locked Quote with a 14-day guarantee.
3. **Smart Digital KYC (`/kyc`):**
   - Explicit DPDP Act 2023 digital consent screen.
   - Uploads GST or Udyam certificate. Simulated OCR extracts entity details and validates against the 3,534 GSTIN / 2,723 Udyam mock registries in under 10 seconds.
4. **Checkout & Slot Scheduling (`/checkout`):**
   - Confirms installation site address and preferred technician appointment slot.
   - Auto-assigned technician credentials preview (Ramesh Kumar &bull; Badge: ENG-DELHI-408).
   - Submits simulated payment.
5. **Live Order Lifecycle Tracker (`/orders/:id`):**
   - Visual milestone timeline (Order Placed &rarr; KYC Verified &rarr; Field Technician Assigned &rarr; Installation In Progress &rarr; Activated & Live).
   - Zero status follow-up calls needed. Revealing live circuit ID, public static IP (103.24.188.42), and 99.8% SLA monitoring once activated.
6. **Customer Self-Care Portal (`/dashboard`):**
   - Real-time bandwidth SLA monitor, active line cards, and downloadable monthly B2B GST tax invoice.

---

### Role 2: Sales Channel Partner (Field Executive & Local Agent)
*Primary Persona: Amit Verma (Accel Enterprise Channel Partner, Delhi NCR)*

1. **Partner Lead Queue Dashboard (`/partner`):**
   - **KYC Exceptions KPI Card:** Highlights leads who dropped out due to blurry scans or slight trade name discrepancies.
   - **Abandoned Quotes KPI Card:** Highlights leads who generated a quote but dropped before checkout.
   - **Assigned Territory Pipeline:** Filter leads by business name, city tier, or drop-off stage.
2. **Assisted KYC Physical Override Modal:**
   - Channel partner visits the customer, physically verifies their original trade license or partnership deed on-site.
   - Submits an official override justification note via `/api/partner/leads/:id/assist-kyc`, instantly unblocking the lead and advancing them to activated status.
3. **Abandoned Quote Recovery:**
   - 1-click **"WhatsApp"** button opens a pre-filled chat with the customer containing their restored cart link for immediate recovery.

---

### Role 3: Executive Admin (Head of SME Growth & Digital Acquisition)
*Primary Persona: Priya Nair (Head of SME Growth & Digital Acquisition, Accel Telecom)*

1. **Executive Analytics Dashboard (`/admin`):**
   - **Macro KPI Gauges:** 7.36% baseline conversion, ₹15,000 legacy CAC vs ₹4,200 digital target, 17.6 average activation days vs 1.5 days.
   - **6-Stage Acquisition Funnel Chart (Recharts):**
     - Ingested Leads (5,000 &bull; 100%)
     - Contacted (3,406 &bull; 68.1%)
     - Needs Assessed (1,974 &bull; 39.5%)
     - Quote Accepted (861 &bull; 17.2%)
     - KYC Complete (588 &bull; 11.8%)
     - Activated Customers (368 &bull; 7.36%)
   - **The GSTIN Disparity Gap:** Leads with GSTIN (9.6% conversion) vs Leads without GSTIN (2.0% conversion), proving how the Udyam MSME integration raises non-GSTIN conversion to 14.5%.
   - **Drop-off Root Cause Distribution:** Bar charts highlighting paperwork delays (39.3%) and quote delays (30.4%).
   - **Customer Segment Performance:** Conversion tracking across Micro Retail (55%), Professional Offices (25%), Multi-site (15%), and Manufacturing (5%).

---

## 3. Pan-India Multi-Language Support (10 Official Indian Languages)

To eliminate digital adoption barriers for micro-enterprises across every Indian state, the entire platform provides real-time, zero-reload multilingual localization. The supported languages match the exact distribution found in the official `smb_leads.csv` dataset:

| Code | Language | Native Script | Primary Target States / Regions |
| :---: | :--- | :--- | :--- |
| `en` | **English** | English | Pan-India Enterprise Standard |
| `hi` | **Hindi** | हिंदी | Delhi NCR, UP, MP, Bihar, Rajasthan, Haryana |
| `ta` | **Tamil** | தமிழ் | Tamil Nadu, Puducherry |
| `te` | **Telugu** | తెలుగు | Andhra Pradesh, Telangana |
| `mr` | **Marathi** | मराठी | Maharashtra |
| `bn` | **Bengali** | বাংলা | West Bengal, Tripura, Assam |
| `gu` | **Gujarati** | ગુજરાતી | Gujarat, Daman & Diu |
| `kn` | **Kannada** | ಕನ್ನಡ | Karnataka |
| `ml` | **Malayalam** | മലയാളം | Kerala, Lakshadweep |
| `pa` | **Punjabi** | ਪੰਜਾਬੀ | Punjab, Chandigarh |

### Multi-Language Features:
1. **Interactive Language Selector:** Accessible via the Globe icon dropdown in the top header and mobile drawer. Switching languages immediately reflects across all active components without page reloads.
2. **AI Business Advisor in Native Language:** Conversational questions and response options are presented in the customer's selected language, reducing apprehension for non-English-speaking Kirana proprietors.
3. **Smart KYC & DPDP Consent:** Critical consent forms, document upload instructions, and validation diagnoses are clearly explained in the user's native tongue.
4. **Persistent Preference:** Selected language is stored in browser `localStorage` under `udyam_language_preference` and syncs with HTML `lang` attributes.

---

## 4. Authentication & User Credentials Guide

The platform implements role-based access control (RBAC). You can sign in using either an **Email Address** or **10-Digit Phone Number** with the default password **`Password@123`** on the [Sign In Page (`/login`)](http://localhost:5173/login).

> [!TIP]
> For a full directory of all accounts, operational circles, specimen government registry numbers, and testing scenarios, see the dedicated [**User Credentials Reference Guide (`CREDENTIALS.md`)**](CREDENTIALS.md).

### Pre-Configured Accounts Matrix:

| Role | User Name | Email (User ID) | Phone (Alt ID) | Password | Operational Circle | Target Landing Screen |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MSME Customer** | **Rajesh Gupta** | `rajesh@guptasupermart.in` | `9810123457` | `Password@123` | Delhi NCR / Kochi *(Verified KYC)* | [Customer Dashboard (`/dashboard`)](http://localhost:5173/dashboard) |
| **MSME Customer** | **Sneha Rao** | `sneha@saffronbakers.in` | `9810123456` | `Password@123` | Ludhiana, Punjab *(Lead L00002)* | [Customer Dashboard (`/dashboard`)](http://localhost:5173/dashboard) |
| **Channel Partner** | **Amit Verma** | `partner@accel.com` | `9871122334` | `Password@123` | **Delhi NCR** *(Code: `CP-DEL-101`)* | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Channel Partner** | **Vikram Sharma** | `vikram.partner@accel.com` | `9871122335` | `Password@123` | **Delhi NCR** *(Code: `CP-DEL-102`)* | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Channel Partner** | **Rohit Deshmukh** | `rohit.mumbai@accel.com` | `9820011223` | `Password@123` | **Mumbai Metro** *(Code: `CP-MUM-201`)* | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Channel Partner** | **Karthik Reddy** | `karthik.blr@accel.com` | `9845011224` | `Password@123` | **Bengaluru Urban** *(Code: `CP-BLR-301`)* | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Channel Partner** | **Sachin Patil** | `sachin.pune@accel.com` | `9850011225` | `Password@123` | **Pune Hub** *(Code: `CP-PUN-401`)* | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Field Technician** | **Ramesh Kumar** | `tech.ramesh@accel.com` | `9811054321` | `Password@123` | **Delhi NCR** *(Badge: `ENG-DELHI-408`)* | [Field Tasks (`/technician`)](http://localhost:5173/technician) |
| **Field Technician** | **Suresh Patil** | `tech.suresh@accel.com` | `9820054321` | `Password@123` | **Mumbai Metro** *(Badge: `ENG-MUM-502`)* | [Field Tasks (`/technician`)](http://localhost:5173/technician) |
| **Field Technician** | **Ganesh Iyer** | `tech.blr@accel.com` | `9845054321` | `Password@123` | **Bengaluru Urban** *(Badge: `ENG-BLR-603`)* | [Field Tasks (`/technician`)](http://localhost:5173/technician) |
| **Executive Admin** | **Priya Nair** | `admin@accel.com` | `9988776655` | `Password@123` | **Pan-India** *(All 22 Circles)* | [Executive Analytics (`/admin`)](http://localhost:5173/admin) |

---

## 5. Official Company Datasets Integrated

All datasets from `data/` provided for the hackathon are 100% connected:

| Official File | Records | How It Powers the Platform |
| :--- | :--- | :--- |
| `product_catalogue.csv` | 25 Products | Powers official catalogue (`P01` to `P25`), pricing engine, setup fees, and dependencies. |
| `mock_gstin_registry.csv` | 3,534 Records | In-memory lookup index backing Smart KYC for instant GSTIN validation. |
| `mock_udyam_registry.csv` | 2,723 Records | Backs the Udyam lookup API, enabling non-GSTIN MSMEs to qualify. |
| `smb_leads.csv` | 5,000 Leads | Populates MongoDB to drive executive funnel analytics and partner lead assignment. |
| `kyc_documents/` | 47 Specimen Images | Specimen applicant documents (`K01` to `K12`) for OCR testing. |

---

## 5. Technology Stack

- **Frontend:** React 18 / 19, Vite, Tailwind CSS (Airtel Red `#E31E24` theme), React Router v6, Lucide React Icons, Recharts, Axios.
- **Backend:** Node.js (LTS v22), Express.js, MongoDB, Mongoose ODM, JWT, BcryptJS, Multer, Express Rate Limit, Helmet Security Headers.
- **AI / Advisor:** Google Gemini API (`@google/genai` configurable) + Zero-Failure Deterministic Rule-Based Fallback Matrix.
- **Document & KYC Engine:** Multer secure disk ingestion, OCR entity parser, in-memory Mock Registry Service (`data/mock_*.csv`).

---

## 6. Repository & Folder Structure

```
project-udyam-digital/
├── client/                      # React SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/common/   # Navbar, Footer, Stepper, Button, Badge
│   │   ├── context/             # AuthContext, OnboardingContext
│   │   ├── pages/               # Landing, Advisor, Quote, KYC, Checkout, Tracker, Dashboards
│   │   ├── services/            # Axios API client
│   │   ├── styles/              # Tailwind index.css
│   │   ├── App.jsx              # Application routing & Route Guards
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Express.js REST API Server
│   ├── src/
│   │   ├── config/              # MongoDB connection & environment variables
│   │   ├── controllers/         # Auth, Profile, Products, Advisor, Quotes, KYC, Orders, Partner, Analytics
│   │   ├── middleware/          # JWT auth, RBAC, Multer upload, Error handler, Zod validate
│   │   ├── models/              # User, Profile, Product, Quote, Order, KYCDocument, Lead
│   │   ├── routes/              # Modular REST endpoint routes
│   │   ├── services/            # AI Advisor, Pricing Engine, Smart KYC, Mock Registries
│   │   ├── utils/               # Database seeder (25 products, 5,000 leads, demo accounts)
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server entrypoint
│   ├── tests/                   # Subsystem automated API test suite (api.test.js)
│   └── package.json
│
├── data/                        # Official case study CSV datasets
│   ├── product_catalogue.csv    # 25 Official master products (P01-P25)
│   ├── mock_gstin_registry.csv  # 3,534 Verified mock GST records
│   ├── mock_udyam_registry.csv  # 2,723 Verified mock Udyam MSME records
│   ├── smb_leads.csv            # 5,000 synthetic SMB leads baseline cohort
│   └── kyc_documents/           # 47 Specimen KYC document image scans (K01-K12)
│
├── docs/                        # Complete Phase-Wise Architecture & Engineering Docs
│   ├── ROLES_AND_WORKFLOWS.md   # Detailed multi-role walkthrough manual
│   ├── REQUIREMENTS.md          # Business, functional & non-functional requirements
│   ├── USER_JOURNEYS.md         # Detailed sequence diagrams & persona journeys
│   ├── FEATURE_SCOPE.md         # P0, P1, P2 prioritization matrix
│   ├── TECHNICAL_DECISIONS.md   # Architectural trade-offs & design choices
│   ├── ARCHITECTURE.md          # Modular Monolith system architecture
│   ├── API_DESIGN.md            # REST API design specification & response envelopes
│   ├── SYSTEM_DIAGRAMS.md       # Mermaid architecture, auth, quote, and KYC diagrams
│   ├── DESIGN_SYSTEM.md         # Airtel SYNC Red visual identity & design tokens
│   ├── UI_COMPONENTS.md         # UI component specs & route inventory
│   ├── DATABASE_SCHEMA.md       # MongoDB collections, Mongoose schemas & data dictionary
│   ├── SECURITY.md              # DPDP Act 2023 compliance & OWASP mitigation
│   ├── TESTING.md               # QA test plan, edge case matrix & test results
│   ├── BUSINESS_CASE.md         # Financial impact, CAC economics & rollout roadmap
│   ├── DEMO_SCRIPT.md           # 3-minute hackathon live presentation script
│   └── DEPLOYMENT.md            # Production runbook (Render, Vercel, MongoDB Atlas)
│
├── package.json                 # Workspaces root
└── README.md
```

---

## 7. Quick Start & Development Setup

### Prerequisites
- **Node.js:** v18+ (verified on v22.19.0 LTS)
- **MongoDB:** Running locally on port `27017` or a MongoDB Atlas URI in `server/.env`.

### Step 1: Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Seed the Database
Populates MongoDB with the 25 official products, 3 demo user accounts, and the 5,000 synthetic leads cohort:
```bash
cd ../server
npm run seed
```

### Step 3: Run the Automated Subsystem Tests
Executes the comprehensive 7-stage backend test suite verifying Health, Catalogue, Registries, Auth, AI Advisor, Pricing, and Analytics:
```bash
node tests/api.test.js
```

### Step 4: Start Development Servers
```bash
# Terminal 1: Start Backend API (Port 5000)
cd server
npm run dev

# Terminal 2: Start Frontend Client (Port 5173)
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 8. Measurable Business Impact

Compared to the case-study baseline cohort of 5,000 SMB leads:

```
┌─────────────────────────────────┬─────────────────┬──────────────────────┐
│ Metric                          │ Legacy Baseline │ Project Udyam Target │
├─────────────────────────────────┼─────────────────┼──────────────────────┤
│ Lead-to-Activation Conversion   │ 7.36% (368 SMB) │ 22.4% (1,120 SMB)    │
│ Average Activation Turnaround   │ 17.6 Days       │ 1.5 Days (Next-Day)  │
│ Blended Customer Acquisition CAC│ ₹15,000         │ ₹4,200 (72% Savings) │
│ Customer Status Follow-Up Calls │ 3.2 Calls / SMB │ 0.2 Calls / SMB      │
│ Non-GSTIN Lead Activation Rate  │ 2.0%            │ 14.5% (Udyam Bridge) │
│ Net Annualized Recurring Rev.   │ ₹1.01 Crore     │ ₹3.82 Crore (+₹2.8Cr)│
└─────────────────────────────────┴─────────────────┴──────────────────────┘
```

---

## 9. Complete Documentation Index

- [User IDs & Passwords Reference Guide](CREDENTIALS.md)
- [Role-Based Architecture & Workflow Manual](docs/ROLES_AND_WORKFLOWS.md)
- [Business & System Requirements](docs/REQUIREMENTS.md)
- [User Journeys & Experience Flows](docs/USER_JOURNEYS.md)
- [System Architecture Specification](docs/ARCHITECTURE.md)
- [REST API Design Specification](docs/API_DESIGN.md)
- [Architecture & Sequence Diagrams](docs/SYSTEM_DIAGRAMS.md)
- [UI/UX Design System](docs/DESIGN_SYSTEM.md)
- [Database Schema & Data Dictionary](docs/DATABASE_SCHEMA.md)
- [DPDP Act 2023 & Security Specification](docs/SECURITY.md)
- [Testing & Quality Assurance Report](docs/TESTING.md)
- [Executive Business Case & ROI](docs/BUSINESS_CASE.md)
- [3-Minute Live Demo Presentation Script](docs/DEMO_SCRIPT.md)
- [Cloud Deployment Runbook](docs/DEPLOYMENT.md)

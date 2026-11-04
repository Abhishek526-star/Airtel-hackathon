# Project Udyam Digital — Making Small Businesses Go Digital in One Sitting

**Airtel SYNC Hackathon 2026 — Enterprise Track A**  
**Fictional Operator Context:** Accel Telecom / Accel Business  
**Prototype Status:** Fully Functional, Tested & Documented  

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

## 2. Core Features Implemented

### P0 — Mandatory Features (Must Have)
- **AI Business Advisor:** Conversational, bilingual (English & Hindi) consultation asking 5 non-redundant operational questions and matching tailored bundles from the official catalogue.
- **25-Product Master Catalogue:** Seeded directly from `product_catalogue.csv` with strict dependency enforcement (e.g. Static IP requires Broadband) and city tier filtering.
- **Interactive Quote Builder:** Live bundle customization, add-on toggles (Static IP, extra SIMs, Cloud backup), and term commitment discounts (12, 24, 36 months).
- **Server-Authoritative Pricing Engine:** 100% itemized calculation of Base MRC, setup fees, contract discounts, and 18% GST (CGST/SGST input credit). Frontend never calculates final prices alone.
- **DPDP Act 2023 Smart KYC:** Explicit digital consent capture, drag-and-drop document upload (PDF/PNG/JPG up to 5MB), simulated OCR entity extraction, and instant verification against `mock_gstin_registry.csv` and `mock_udyam_registry.csv`.
- **Checkout & Installation Slot:** Site address capture, preferred appointment slot picker, auto-assigned field technician preview, and simulated digital checkout.
- **Live Visual Order Tracker:** Milestone timeline (Order Placed &rarr; KYC Verified &rarr; Field Technician Assigned &rarr; Installation In Progress &rarr; Activated & Live) with live SLA uptime monitoring, circuit ID, and static IP provisioning.

### P1 — Important Features (Should Have)
- **Customer Self-Care Dashboard:** Real-time broadband SLA telemetry (99.8%), active lines overview, and simulated monthly B2B GST tax invoice preview and download.
- **Sales Partner Assisted Portal:** Channel partner lead management pipeline with filters for KYC failures, abandoned quote recovery, and assisted verification overrides.
- **Executive Cohort Analytics:** Interactive Recharts dashboard analyzing the 5,000-lead case study cohort, 6-stage funnel drop-offs, CAC comparison (₹15,000 vs ₹4,200), and the GSTIN disparity gap.
- **JWT Authentication & RBAC:** Role-based access control protecting Customer, Partner, and Admin resources with Bcrypt password hashing.

---

## 3. Technology Stack

- **Frontend:** React 18 / 19, Vite, Tailwind CSS (Airtel Red `#E31E24` theme), React Router v6, Lucide React Icons, Recharts, Axios.
- **Backend:** Node.js (LTS v22), Express.js, MongoDB, Mongoose ODM, JWT, BcryptJS, Multer, Express Rate Limit, Helmet Security Headers.
- **AI / Advisor:** Google Gemini API (`@google/genai` configurable) + Zero-Failure Deterministic Rule-Based Fallback Matrix.
- **Document & KYC Engine:** Multer secure disk ingestion, OCR entity parser, in-memory Mock Registry Service (`data/mock_*.csv`).

---

## 4. Repository & Folder Structure

```
project-udyam-digital/
├── client/                      # React SPA (Vite + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── components/common/   # Navbar, Footer, Stepper, Button, Badge
│   │   ├── context/             # AuthContext, OnboardingContext
│   │   ├── pages/               # Landing, Advisor, Quote, KYC, Checkout, Tracker, Dashboards
│   │   ├── services/            # Axios API client
│   │   ├── styles/              # Tailwind index.css
│   │   ├── App.jsx              # Application routing & Route Guards
│   │   └── main.jsx
│   ├── index.html
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
│   ├── .env.example
│   └── package.json
│
├── data/                        # Case study CSV datasets
│   ├── product_catalogue.csv    # 25 Official master products
│   ├── mock_gstin_registry.csv  # Verified mock GST records (Active, Cancelled, Suspended)
│   ├── mock_udyam_registry.csv  # Verified mock Udyam MSME records
│   ├── smb_leads.csv            # 5,000 synthetic SMB leads baseline cohort
│   └── README.md                # Data documentation
│
├── docs/                        # Complete Phase-Wise Architecture & Engineering Docs
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

## 5. Quick Start & Development Setup

### Prerequisites
- **Node.js:** v18+ (verified on v22.19.0 LTS)
- **MongoDB:** MongoDB Community Server (listening on `localhost:27017`) or MongoDB Atlas connection string.

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

### Step 4: Start the Development Servers
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

## 6. Pre-Configured Demo Credentials

For quick evaluation during hackathon judging, use the **One-Click Persona Switcher** in the top navigation bar or log in manually with:

| Persona Role | Name & Target | Email | Password |
| :--- | :--- | :--- | :--- |
| **Micro Retail Owner (P0)** | Rajesh Gupta (Kirana) | `rajesh@guptasupermart.in` | `Password@123` |
| **Channel Partner** | Amit Verma (Delhi NCR) | `partner@accel.com` | `Password@123` |
| **Executive Admin** | Priya Nair (Growth Head) | `admin@accel.com` | `Password@123` |

---

## 7. Key Measurable Business Impact

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

## 8. Hackathon Submission Deliverables Index

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

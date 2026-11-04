# PROJECT UDYAM DIGITAL — TECHNICAL DECISIONS & ARCHITECTURAL TRADEOFFS
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Platform:** Project Udyam Digital (Accel Business)  
**Document Status:** Complete (Phase 0 Baseline)  

---

## 1. Architectural Style: Modular Monolith vs. Microservices

### Decision:
We select a **Modular Monolith** architecture with a clean separation of concerns between client (React + Vite SPA) and server (Express.js RESTful API).

### Rationale & Trade-offs:
- **Pros:**
  - Rapid, robust local development with zero distributed system orchestration overhead (no Kubernetes, Kafka, or service meshes required for a hackathon prototype).
  - ACID guarantees within single MongoDB collections and straightforward transactional consistency for Order, KYC, and Quote states.
  - Simplified shared domain types, unified logging, and single-port deployment to platforms like Render or Railway.
- **Cons:**
  - Independent scaling of individual services (e.g. AI engine vs. static catalogue) is handled in-process rather than at container level.
- **Mitigation:**
  - The server code is strictly organized into decoupled domain modules (`services/ai/`, `services/pricing/`, `services/kyc/`, `services/registry/`, `controllers/`, `routes/`, `models/`). If required in future enterprise production, any module can be extracted into an independent microservice with zero changes to business logic.

---

## 2. Frontend Framework & State Management

### Decisions:
- **Core Framework:** React 18 / 19 with Vite for ultra-fast HMR and bundle optimization.
- **Styling:** Tailwind CSS with a custom enterprise design system token configuration matching the Airtel SYNC palette (Primary Red `#E31E24`, Dark Red `#B5121B`, Slate Dark `#111827`, Background `#F8FAFC`).
- **Icons & Graphics:** `lucide-react` for clean, consistent UI iconography.
- **Charts & Data Visuals:** `recharts` for responsive, interactive dashboard analytics.
- **Routing:** `react-router-dom` (v6+) with role-based Route Guards (`CustomerRoute`, `PartnerRoute`, `AdminRoute`).
- **State Management:**
  - Context API + custom hooks (`useAuth`, `useQuote`, `useAdvisor`, `useKYC`) for localized application state to avoid boilerplate Redux bloat while keeping state clean, reactive, and predictable.

---

## 3. Backend Runtime, Framework & Database

### Decisions:
- **Runtime & Server:** Node.js (v22 LTS) with Express.js.
- **Database:** MongoDB with Mongoose ODM.
- **Authentication:** Stateless JSON Web Tokens (JWT) stored in HTTP headers/localStorage with password encryption via `bcryptjs`.
- **Validation:** Zod schemas shared for request payload verification.

### Rationale:
- MongoDB handles flexible document schemas perfectly for:
  - Complex multi-item quotes with dynamic attributes.
  - Heterogeneous KYC document metadata and OCR extraction JSON payloads.
  - Multi-tier product catalogue specifications with varied bandwidth, SLA, and hardware bundles.
- Local MongoDB service is already verified running and listening on `localhost:27017` in the development environment.

---

## 4. AI & Recommendation Architecture

### Decisions:
- **Hybrid Multi-Tier Engine:**
  - **Tier 1 (Catalogue Filter & Constraint Solver):** Deterministic JavaScript engine that strictly filters the 25-product catalogue based on city tier eligibility, GSTIN availability, and hard dependencies.
  - **Tier 2 (AI Reasoning & Justification):** Integration with Google Gemini API (`@google/genai` or direct REST) to generate conversational dialogue, understand nuanced customer descriptions, and author persuasive business justifications.
  - **Tier 3 (Deterministic Expert Matrix Fallback):** If an API key is not supplied, rate-limited, or network fails, an internal rule-based expert recommendation matrix instantly executes, guaranteeing 100% reliability during live demonstrations.
- **Protection Against Hallucinations:**
  - The LLM is **never** permitted to generate product prices, product SKUs, or inventory independently. It receives the filtered, validated product array and is constrained to output structured JSON mapping directly to catalogue IDs.

---

## 5. Smart KYC & OCR Processing Strategy

### Decisions:
- **Document Ingestion:** Multer middleware handling multipart uploads with strict MIME-type validation (`image/jpeg`, `image/png`, `application/pdf`) and a 5MB size ceiling.
- **Text Extraction:** Hybrid OCR approach:
  - Primary: High-fidelity pattern matcher and mock OCR parser for predictable test datasets.
  - Secondary: `tesseract.js` integration for extracting raw text from uploaded images.
- **Registry Validation:** Mock Registry Service loading `mock_gstin_registry.csv` and `mock_udyam_registry.csv` into indexed in-memory maps for sub-50ms deterministic lookups.
- **Privacy (DPDP Act 2023):** Explicit consent timestamping, masked PII logging, and segregated storage.

---

## 6. Directory Structure Standard

Following the master prompt specifications:
```
project-udyam-digital/
├── client/          (React + Vite + Tailwind CSS)
├── server/          (Express + Mongoose + Domain Services)
├── data/            (CSV Datasets: catalogue, leads, mock registries)
├── docs/            (Architecture, Requirements, Design System, etc.)
└── package.json     (Root workspaces configuration)
```

---

## 7. Baseline Synthetic Data Assumptions

In accordance with Phase 4, Phase 7, and Phase 10 guidelines:
1. **Product Catalogue (25 Products):** If a local CSV is not yet in the root folder, we seed the exact 25 products representing the complete Accel Business portfolio across Broadband, Voice, Cloud, Security, and IoT.
2. **Mock GSTIN Registry:** Contains real-format 15-character Indian GSTINs with active, cancelled, and suspended statuses for realistic demo scenarios.
3. **Mock Udyam Registry:** Contains 19-character Udyam registration numbers (`UDYAM-XX-00-0000000`) with matching enterprise names.
4. **SMB Leads Cohort:** Contains the 5,000 synthetic leads matching the exact case-study baseline metrics (368 activations, 7.36% conversion, 17.6 days avg lead-to-activation time, ₹15,000 CAC).


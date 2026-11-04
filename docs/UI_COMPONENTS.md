# PROJECT UDYAM DIGITAL — UI COMPONENT SPECIFICATIONS
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Platform:** Project Udyam Digital (Accel Business)  
**Document Status:** Complete (Phase 2 Baseline)  

---

## 1. Core Reusable Component Library

The frontend architecture implements an atomic, modular component library located in `client/src/components/common/`:

### 1.1 `Button`
- **Variants:**
  - `primary`: Background `#E31E24`, Text `#FFFFFF`, hover `bg-red-700`, active scale animation.
  - `secondary`: Slate outline `border border-slate-300 text-slate-700 bg-white hover:bg-slate-50`.
  - `accent`: Dark Slate `bg-slate-900 text-white hover:bg-slate-800`.
  - `ghost`: Transparent with slate text and subtle hover fill.
- **Props:** `variant`, `size` (`sm`, `md`, `lg`), `isLoading` (renders spinner), `disabled`, `icon`, `onClick`.

### 1.2 `Input` & `Select`
- **States:** Default, Focused (`ring-2 ring-red-500 border-red-500`), Error (`border-red-600 bg-red-50/20`), Disabled.
- **Features:** Floating or persistent label, inline helper text, validation error message banner, leading/trailing icon slots.

### 1.3 `Badge` / `Pill`
- **Variants:**
  - `success`: `bg-emerald-50 text-emerald-700 border-emerald-200` (e.g. "KYC Verified", "99.8% SLA")
  - `warning`: `bg-amber-50 text-amber-700 border-amber-200` (e.g. "Pending Inspection")
  - `danger`: `bg-red-50 text-red-700 border-red-200` (e.g. "Invalid GSTIN")
  - `brand`: `bg-red-100 text-red-800 border-red-200` (e.g. "Recommended")
  - `neutral`: `bg-slate-100 text-slate-700 border-slate-200`

### 1.4 `Card`
- **Specifications:** Clean white surface (`bg-white`), subtle 1px border (`border-slate-200`), rounded corners (`rounded-xl`), smooth elevation transition on hover (`hover:shadow-md transition-shadow`).

### 1.5 `Stepper` / `ProgressIndicator`
- **Specifications:** Displays numeric or labeled progress across the 5 onboarding steps:
  1. Discovery & Profile $\to$ 2. AI Recommendation $\to$ 3. Quote Customizer $\to$ 4. Smart KYC $\to$ 5. Order Activation.
- **Visuals:** Completed steps marked with red checkmark; active step highlighted with glowing red badge; future steps dimmed in cool gray.

### 1.6 `Modal` & `Dialog`
- **Specifications:** Accessible overlay with backdrop blur (`backdrop-blur-sm bg-slate-900/60`), centered animated dialog card, escape key listener, and focus trapping.

### 1.7 `SkeletonLoader`
- **Specifications:** Subtle shimmer animation across card skeletons, price calculation placeholders, and chart containers during asynchronous fetches.

---

## 2. Screen Specifications & Route Inventory

| Screen ID | Route | Screen Name | Key Elements & Responsibilities |
| :--- | :--- | :--- | :--- |
| **SCR-01** | `/` | **Landing Page** | Value prop hero, Segment selector, "One Sitting" interactive walkthrough, Trust & DPDP badges, FAQ. |
| **SCR-02** | `/login` | **Authentication Login** | Email/Phone + password input, role switcher (Customer/Partner/Admin demo pills for one-click reviewer evaluation). |
| **SCR-03** | `/register` | **User Registration** | Full name, mobile, email, password, instant profile initialization. |
| **SCR-04** | `/onboarding/profile` | **Business Profile Setup** | Enterprise name, GSTIN prompt, industry segment, employee count, city tier, current ISP. |
| **SCR-05** | `/advisor` | **AI Business Advisor** | Dynamic chat interface, suggested answer pills, business profile drawer, live recommendation card generator. |
| **SCR-06** | `/quote/builder` | **Interactive Quote Builder** | Selected bundle items, optional add-ons slider (Static IP, extra SIMs), contract term toggle (12/24/36m), live pricing breakdown. |
| **SCR-07** | `/checkout` | **Checkout & Address** | Installation site address, contact person, installation slot picker, simulated payment action. |
| **SCR-08** | `/kyc` | **Smart KYC & Consent** | DPDP 2023 explicit consent agreement, drag-and-drop document upload, real-time OCR extraction preview. |
| **SCR-09** | `/kyc/results` | **KYC Status Screen** | Instant registry validation verdict (Active GSTIN / Verified Udyam), discrepancy alerts, retry mechanism. |
| **SCR-10** | `/orders/tracker/:id` | **Visual Order Tracker** | Real-time milestone tracker, assigned field technician badge, scheduled date, live helpline toggle. |
| **SCR-11** | `/dashboard` | **Customer Dashboard** | Active broadband line health, SLA uptime gauge, monthly invoice PDF viewer, service add-on launcher. |
| **SCR-12** | `/partner/dashboard` | **Sales Partner Portal** | Assigned lead pipeline, abandoned quote alerts, assisted KYC upload and override actions. |
| **SCR-13** | `/admin/analytics` | **Executive Analytics** | 5,000 lead cohort metrics, 6-stage funnel drop-off chart, CAC comparison, city tier performance. |
| **SCR-14** | `/catalogue` | **Product Catalogue** | Grid of all 25 products, search bar, category tabs, filter by tier and GSTIN requirement. |

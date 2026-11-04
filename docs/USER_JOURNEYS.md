# PROJECT UDYAM DIGITAL — USER JOURNEYS & EXPERIENCE FLOWS
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Platform:** Project Udyam Digital (Accel Business)  
**Document Status:** Complete (Phase 0 Baseline)  

---

## 1. Journey 1: Primary Self-Service Customer Journey (Mobile-First)

### Persona: Rajesh Gupta (Owner of Gupta Supermart, Sector 18, Noida)
**Goal:** Upgrade shop connectivity from unstable consumer Wi-Fi to a dedicated enterprise business bundle with static IP, commercial WhatsApp communication, and POS backup within one 10-minute sitting on his smartphone.

```mermaid
sequenceDiagram
    autonumber
    actor User as Rajesh (Mobile User)
    participant UI as Udyam Digital UI (PWA/Web)
    participant Auth as Auth & Profile Service
    participant Advisor as AI Business Advisor
    participant Pricing as Pricing & Quote Engine
    participant KYC as Smart KYC Engine
    participant Registry as Mock Registry Service
    participant Order as Order & Lifecycle Service

    User->>UI: Lands on Udyam Digital homepage
    UI->>User: Displays clear value prop ("Digital in One Sitting")
    User->>UI: Clicks "Get Digital Bundle" & registers (Phone + OTP/Password)
    UI->>Auth: POST /api/auth/register & profile setup
    Auth-->>UI: 201 Created (JWT Token + User Profile)

    Note over User,Advisor: Step 2: AI Business Advisor Consultation
    UI->>Advisor: Initializes Advisor session (Hindi/English selected)
    Advisor->>UI: "Namaste Rajesh ji! What type of business do you run?"
    User->>UI: Taps "Retail Store / Supermarket (Kirana)"
    Advisor->>UI: "How many staff work at your shop?" -> User: "1 to 5"
    Advisor->>UI: "Do you process digital payments (UPI/POS)?" -> User: "Yes, heavy UPI & POS"
    Advisor->>UI: "Do you communicate with customers via WhatsApp?" -> User: "Yes, daily for orders"
    Advisor->>UI: "What is your monthly target budget?" -> User: "₹1,500 – ₹3,000/mo"
    
    Note over Advisor,Pricing: Hybrid Matching & Justification
    Advisor->>Advisor: Filter eligible products: Broadband 200Mbps, Static IP, WhatsApp API, 2 Biz SIMs
    Advisor-->>UI: Returns "Retail Express Smart Bundle" + Human Reasoning

    Note over User,Pricing: Step 3: Bundle Customization & Transparent Quote
    UI->>User: Renders interactive bundle card with breakdown
    User->>UI: Adjusts contract term to 12 Months, keeps 2 SIMs
    UI->>Pricing: POST /api/quotes/calculate
    Pricing-->>UI: Breakdown: MRC ₹1,899 + Setup ₹500 + GST (18%) ₹431.82 = ₹2,830.82 Total
    User->>UI: Clicks "Lock & Accept Quote"
    UI->>Pricing: POST /api/quotes/accept -> Generates Quote ID: ACCEL-Q-9821

    Note over User,KYC: Step 4: Digital Consent & Smart KYC Verification
    UI->>User: DPDP Consent Screen ("We use GST/Udyam solely for telecom verification")
    User->>UI: Checks consent box & clicks "Proceed to Smart KYC"
    UI->>KYC: POST /api/kyc/consent
    UI->>User: Prompts for GST Certificate / Udyam Certificate upload
    User->>UI: Takes mobile photo of GST certificate (or uploads PDF)
    UI->>KYC: POST /api/kyc/upload (Multipart)
    KYC->>KYC: OCR Extraction (Extracts GSTIN: 07AAAAA0000A1Z5, Trade Name: GUPTA SUPERMART)
    KYC->>Registry: GET /api/mock/gstin/07AAAAA0000A1Z5
    Registry-->>KYC: Match Found: Status ACTIVE, Address Verified
    KYC-->>UI: Real-time verification badge: "KYC Verified Instantly!"

    Note over User,Order: Step 5: Checkout & Order Submission
    User->>UI: Confirms installation address & preferred slot (Tomorrow 10 AM - 1 PM)
    User->>UI: Taps "Submit Order & Schedule Activation" (Simulated Checkout)
    UI->>Order: POST /api/orders/create
    Order-->>UI: 201 Created: Order #ACCEL-ORD-4491
    UI->>User: Redirects to Visual Order Tracker

    Note over User,Order: Step 6: Visual Lifecycle Tracking
    User->>UI: Views live tracker: [Order Placed] -> [KYC Verified] -> [Engineer Assigned: Ramesh Kumar]
```

### Edge Cases & Exception Handling in Journey 1:
1. **GSTIN / Udyam Not Available:**
   - *Flow:* If Rajesh has neither GSTIN nor Udyam, the platform does not block him. Instead, it flags the KYC as `NEEDS_REVIEW`, automatically restricts products requiring mandatory GSTIN (such as Leased Line or Multi-SIM Pooling), recommends single-line business broadband with PAN + Shop Electricity Bill, and schedules a priority field verification visit.
2. **OCR Failure / Blurry Image:**
   - *Flow:* If the camera photo is unreadable, the OCR engine alerts: *"Document text is unclear. Please re-upload a sharper image or enter GSTIN manually for instant validation."* Rajesh enters the 15-digit GSTIN manually, and the registry validates it seamlessly.
3. **Budget Exceeded:**
   - *Flow:* If the recommended bundle exceeds the user's selected budget, the advisor highlights an *"Economical Tier"* switch, swapping 500Mbps for 100Mbps and reducing optional static IP to bring the price within target range.

---

## 2. Journey 2: Assisted Channel Partner / Sales Executive Journey

### Persona: Amit Verma (Accel Business Channel Partner, Delhi NCR)
**Goal:** Track local business leads, assist customers who abandoned their quotes or failed document uploads, and accelerate lead-to-activation turnaround from 17 days down to under 24 hours.

```mermaid
sequenceDiagram
    autonumber
    actor Partner as Amit (Channel Partner)
    participant UI as Partner Dashboard UI
    participant LeadService as Lead & Opportunity Service
    participant QuoteService as Quote Service
    participant OrderService as Order Tracking Service

    Partner->>UI: Log in with Partner credentials (partner@accel.com)
    UI->>Partner: Displays Partner Dashboard: 28 Total Assigned Leads, 4 KYC Exceptions, 6 Abandoned Quotes
    Partner->>UI: Filters leads by status: "KYC_FAILED" & "ABANDONED_QUOTE"
    Partner->>UI: Selects Lead "Sharma Chemist & Druggist" (Propensity Score: 88/100)
    UI->>LeadService: GET /api/partner/leads/:id
    LeadService-->>UI: Lead details: Quote generated ₹2,499/mo; Document upload failed (Name mismatch)
    
    Partner->>Partner: Calls customer directly with pre-filled context
    Partner->>UI: Clicks "Assisted Document Resubmission"
    Partner->>UI: Uploads corrected Partnership Deed / Trade License verified on-site
    UI->>LeadService: POST /api/partner/leads/:id/override-kyc
    LeadService-->>UI: Status updated to "KYC_VERIFIED"
    
    Partner->>UI: Assigns Field Engineer & sets installation slot: "Today 4:00 PM"
    UI->>OrderService: PATCH /api/orders/:id/schedule
    OrderService-->>UI: Installation Scheduled. SMS/In-app notification dispatched to customer.
```

### Key Partner Capabilities:
- **Instant Abandoned Quote Recovery:** View cart items left by MSMEs and trigger a one-click WhatsApp reminder with an instant checkout link.
- **KYC Exception Resolving:** Upload verified secondary proofs when automated OCR flags small typographical discrepancies between trade name and PAN card.
- **Field Engineer Dispatch:** Real-time visibility into local technician queues to schedule fiber pulls and CPE router deliveries within 24 hours.

---

## 3. Journey 3: Executive Admin & Analytics Journey

### Persona: Priya Nair (Head of SME Growth & Digital Acquisition, Accel Telecom)
**Goal:** Monitor macro conversion performance across the 5,000-lead cohort, identify acquisition friction points, track Customer Acquisition Cost (CAC), and assess bundle profitability.

```mermaid
flowchart TD
    A[Admin Login: admin@accel.com] --> B[Executive Analytics Dashboard]
    B --> C[Funnel Conversion Stage]
    B --> D[Acquisition Cost & MRR]
    B --> E[Segment & City Tier Performance]
    B --> F[Catalogue & Bundle Popularity]

    C --> C1["Baseline 5,000 Leads (7.36% conv) vs. Digital Platform Target (>22% conv)"]
    C --> C2["Drop-off Heatmap: Quote Acceptance (42%) -> KYC Drop (68% without digital KYC)"]

    D --> D1["Blended CAC: ₹15,000 Baseline vs. ₹4,200 Digital-First Target"]
    D --> D2["Monthly Recurring Revenue (MRR): Active 368 vs. Projected 1,100"]

    E --> E1["Tier 1 vs. Tier 2 vs. Tier 3 Conversion Rates"]
    E --> E2["GSTIN-holding Leads (9.6% baseline) vs. Non-GSTIN (2.0% baseline)"]

    F --> F1["Top Bundles: Retail Express, Office Pro Suite, Logistics Connect"]
    F --> F2["Average Setup Fee Realization & Contract Duration Distribution"]
```

---

## 4. Journey 4: Post-Activation Customer Self-Care Journey

### Persona: Adv. Sneha Sen Sharma (Post-Activation Legal Office)
**Goal:** Manage active broadband lines, monitor office data quota and Wi-Fi security, review monthly GST tax invoices, and request additional cloud storage in seconds without calling customer support.

```mermaid
flowchart LR
    A[Customer Dashboard Login] --> B{Active Services}
    B --> C[Broadband 500Mbps: Status Active 99.8% SLA]
    B --> D[Office Cloud PBX: 4 Ext Lines Active]
    B --> E[Cloud Security: 1TB Encrypted Vault]
    
    A --> F[Consolidated Invoicing]
    F --> G[Download GST Compliant B2B Tax Invoice]
    
    A --> H[Service Add-ons]
    H --> I[Add Static IP / Expand Bandwidth in 1-Click]
```

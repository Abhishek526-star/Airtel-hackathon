# PROJECT UDYAM DIGITAL — SYSTEM ARCHITECTURE DIAGRAMS
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Platform:** Project Udyam Digital (Accel Business)  
**Document Status:** Complete (Phase 1 Baseline)  

---

## 1. End-to-End System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["Frontend Client Tier (React + Vite + Tailwind CSS)"]
        Landing["Landing & Hero Page"]
        AdvisorUI["AI Business Advisor (Chat & Question UI)"]
        QuoteUI["Interactive Quote Builder & Pricing UI"]
        KycUI["Smart KYC & Document Upload UI"]
        OrderUI["Visual Order Lifecycle Tracker"]
        CustDash["Customer Self-Care Dashboard"]
        PartnerDash["Channel Partner Assisted Portal"]
        AdminDash["Executive Analytics Dashboard (Recharts)"]
    end

    subgraph GatewayLayer["API Gateway & Middleware Layer (Express.js)"]
        CORS["CORS & Helmet Guard"]
        RateLimit["Rate Limiting"]
        AuthFilter["JWT & RBAC Security Guard"]
        UploadFilter["Multer Multipart Validator"]
        ErrHandler["Centralized Error Handler"]
    end

    subgraph ServiceLayer["Core Domain Services"]
        AuthSvc["Auth & Security Service"]
        CatSvc["Catalogue & Dependency Solver (25 Prods)"]
        AiSvc["AI Advisor Service (Gemini API + Fallback)"]
        PriceSvc["Pricing & Tax Engine (18% GST)"]
        KycSvc["Smart KYC & OCR Extraction Service"]
        RegSvc["Mock Registries Service (GSTIN & Udyam)"]
        OrderSvc["Order State Machine Engine"]
        PartnerSvc["Partner Assisted Selling Service"]
        AnalyticsSvc["Cohort Analytics & Funnel Engine"]
    end

    subgraph PersistenceLayer["Storage & Data Tier"]
        MongoDb[(MongoDB Database: Users, Quotes, Orders, Leads)]
        CSVData[("Static Synthetic Data (data/*.csv)")]
        DocStore[("Secure Document Storage")]
    end

    ClientLayer --> GatewayLayer
    GatewayLayer --> ServiceLayer
    ServiceLayer --> PersistenceLayer
```

---

## 2. Authentication & Authorization Flow (JWT + RBAC)

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Partner / Admin
    participant Client as React Client (AuthContext)
    participant AuthRoute as /api/auth Controller
    participant AuthService as AuthService
    participant DB as MongoDB (Users)

    User->>Client: Enters Email / Phone & Password
    Client->>AuthRoute: POST /api/auth/login
    AuthRoute->>AuthService: Validate credentials
    AuthService->>DB: Find user by email
    DB-->>AuthService: Return user document (hashed password)
    AuthService->>AuthService: Compare password via bcrypt.compare()
    alt Password Invalid
        AuthService-->>Client: 401 Unauthorized ("Invalid credentials")
    else Password Valid
        AuthService->>AuthService: Sign JWT token (userId, role, exp: 24h)
        AuthService-->>Client: 200 OK (token, user: { id, fullName, role, businessProfile })
        Client->>Client: Store token in secure storage & set Axios auth header
        Client->>User: Route to role dashboard (Customer, Partner, or Admin)
    end
```

---

## 3. AI Advisor & Hybrid Recommendation Flow

```mermaid
flowchart TD
    A[User answers 4-6 business questions] --> B[POST /api/advisor/recommend]
    B --> C[Constraint Solver & Eligibility Filter]
    
    C --> C1{Check City Tier & Headcount}
    C --> C2{Check GSTIN Requirement}
    C --> C3{Check Product Dependencies}
    
    C1 & C2 & C3 --> D[Filtered Candidate Products (from 25 Prods)]
    
    D --> E{Gemini API Configured & Available?}
    
    E -- Yes --> F[Call Google Gemini 2.5 Flash API with Strict Schema]
    E -- No / Timeout --> G[Invoke Deterministic Rule-Based Expert Matrix]
    
    F --> H[Validate JSON Schema & Catalogue IDs]
    G --> H
    
    H --> I[Assemble Final Recommendation Bundle]
    I --> J[Return Structured Recommendation + Plain-Language Justification]
    J --> K[User reviews bundle & clicks 'Add to Quote']
```

---

## 4. Quote Generation & Pricing Engine Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Business Owner
    participant Client as Quote Builder UI
    participant QuoteAPI as /api/quotes
    participant PricingEngine as Server Pricing Engine
    participant DB as MongoDB (Quotes)

    User->>Client: Modifies bundle (adds Static IP, changes contract to 24 mo)
    Client->>QuoteAPI: POST /api/quotes/calculate (productIds, quantities, contractMonths)
    QuoteAPI->>PricingEngine: Compute price breakdown
    PricingEngine->>PricingEngine: Sum base monthly charges (MRC)
    PricingEngine->>PricingEngine: Apply term discount (e.g. 5% on 24 mo, 10% on 36 mo)
    PricingEngine->>PricingEngine: Sum setup & installation fees
    PricingEngine->>PricingEngine: Compute 18% GST on (MRC + Setup Fee)
    PricingEngine->>PricingEngine: Calculate total one-time initial payable + recurring bill
    PricingEngine-->>Client: Return itemized breakdown for real-time UI preview
    
    User->>Client: Clicks "Lock & Accept Quote"
    Client->>QuoteAPI: POST /api/quotes/create
    QuoteAPI->>DB: Save locked quote record (Status: ACCEPTED)
    DB-->>Client: Return quoteId (ACCEL-Q-XXXX)
    Client->>Client: Transition smoothly to Smart KYC
```

---

## 5. Smart KYC Processing & Verification Flow

```mermaid
flowchart TD
    A[User reviews DPDP 2023 Consent Notice] --> B[User checks consent: POST /api/kyc/consent]
    B --> C[Uploads Business Document: GST / Udyam / Trade Certificate]
    C --> D[Multer validates MIME type & size <= 5MB]
    D --> E[OCR Text & Entity Extraction Engine]
    
    E --> F[Extract: Entity Name, GSTIN / Udyam No, Address, Signatory]
    
    F --> G{Document Type?}
    
    G -- GST Certificate --> H[Query Mock GSTIN Registry]
    G -- Udyam Certificate --> I[Query Mock Udyam Registry]
    
    H --> J{GSTIN Status in Registry?}
    I --> K{Udyam Status in Registry?}
    
    J -- ACTIVE & Name matches --> L[Set KYC Status: VERIFIED]
    J -- CANCELLED / SUSPENDED --> M[Set KYC Status: REJECTED with specific reason]
    J -- Not Found / Ambiguous --> N[Set KYC Status: NEEDS_REVIEW (Partner escalation)]
    
    K -- ACTIVE --> L
    K -- Not Found --> N
    
    L & M & N --> O[Update KYC Record & Return Real-time Verification Badge to Client]
```

---

## 6. Order Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> ORDER_PLACED : Quote Accepted & Checkout Submitted
    ORDER_PLACED --> KYC_PENDING : Consent & Document Awaited
    
    KYC_PENDING --> KYC_VERIFIED : Automated Smart KYC Succeeded
    KYC_PENDING --> NEEDS_REVIEW : Document Discrepancy (Sales Partner Assisted)
    NEEDS_REVIEW --> KYC_VERIFIED : Partner Assisted Resolution / Override
    KYC_PENDING --> REJECTED : Fraudulent / Cancelled GSTIN
    
    KYC_VERIFIED --> INSTALLATION_SCHEDULED : Engineer & Time Slot Confirmed
    INSTALLATION_SCHEDULED --> INSTALLATION_IN_PROGRESS : Technician on Site
    INSTALLATION_IN_PROGRESS --> ACTIVATED : CPE Provisioned & Signal Verified
    
    ACTIVATED --> [*] : Active Billing & Customer Dashboard Live
    REJECTED --> [*]
```

---

## 7. Data Flow & Entity Relationships

```mermaid
erDiagram
    USER ||--o{ BUSINESS_PROFILE : owns
    USER ||--o{ QUOTE : generates
    USER ||--o{ ORDER : places
    USER ||--o{ NOTIFICATION : receives
    
    QUOTE ||--|{ ORDER : fulfills
    ORDER ||--|| KYC_DOCUMENT : verifies
    
    PRODUCT ||--o{ QUOTE_ITEM : included_in
    
    USER {
        string id PK
        string fullName
        string email
        string phone
        string passwordHash
        string role "customer | partner | admin"
        date createdAt
    }
    
    BUSINESS_PROFILE {
        string id PK
        string userId FK
        string legalName
        string tradeName
        string segment "Micro Retail | Professional Office | Multi-site | Manufacturer"
        int employees
        string cityTier "Tier 1 | Tier 2 | Tier 3"
        string gstin
        string udyamNumber
    }
    
    PRODUCT {
        string productId PK
        string productName
        string category
        int monthlyPrice
        int setupFee
        int contractDuration
        string cityTier
        boolean gstinRequired
        string dependencies
    }
    
    QUOTE {
        string quoteId PK
        string userId FK
        json items
        int totalMrc
        int setupFees
        int gstAmount
        int totalInitialPayable
        string status "DRAFT | ACCEPTED | EXPIRED"
    }
    
    ORDER {
        string orderId PK
        string quoteId FK
        string userId FK
        string kycStatus
        string orderStatus
        string assignedEngineer
        date scheduledInstallation
        date activatedAt
    }
    
    KYC_DOCUMENT {
        string id PK
        string orderId FK
        string documentType
        string fileUrl
        json extractedData
        string registryStatus
        date verifiedAt
    }
```


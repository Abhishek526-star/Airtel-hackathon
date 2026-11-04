# PROJECT UDYAM DIGITAL — REST API DESIGN SPECIFICATION
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Platform:** Project Udyam Digital (Accel Business)  
**Protocol:** RESTful JSON over HTTP/HTTPS  
**Document Status:** Complete (Phase 1 Baseline)  

---

## 1. Global API Conventions & Standards

### 1.1 Base URL Standard
- Development: `http://localhost:5000/api`
- Production: `https://udyam-api.accelbusiness.in/api`

### 1.2 Unified Response Envelope
Every API response uniformly adheres to the standardized envelope:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "error": null
}
```

When an error occurs:
```json
{
  "success": false,
  "message": "Descriptive human-readable error summary",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "email", "issue": "Invalid email address format" }
    ]
  }
}
```

### 1.3 Standard HTTP Status Codes
- `200 OK`: Successful retrieval or synchronous update.
- `201 Created`: Successful resource creation (User, Quote, Order).
- `400 Bad Request`: Validation failure or malformed payload.
- `401 Unauthorized`: Missing, invalid, or expired JWT token.
- `403 Forbidden`: Authenticated user lacks required role permissions.
- `404 Not Found`: Target resource does not exist.
- `422 Unprocessable Entity`: Business constraint violation (e.g. missing product dependency).
- `500 Internal Server Error`: Unhandled server exception with sanitized logging.

---

## 2. API Endpoints Catalog

### 2.1 Authentication & Authorization (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (`fullName`, `email`, `phone`, `password`, `role`). |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and return JWT token + user profile. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user session context and roles. |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate token or client session. |

### 2.2 Business Profile Management (`/api/profile`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Customer | Fetch current customer's registered business profile. |
| `POST` | `/api/profile` | Customer | Create or initialize business profile. |
| `PUT` | `/api/profile` | Customer | Update existing business attributes (employees, locations, ISP). |

### 2.3 Product Catalogue (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Retrieve 25 products with optional query filters (`category`, `tier`, `gstin`). |
| `GET` | `/api/products/:id` | Public | Get granular details, prerequisites, and pricing for a single product. |
| `POST` | `/api/products/validate-selection` | Public | Validate cart bundle against prerequisite dependencies and tier eligibility. |

### 2.4 AI Business Advisor (`/api/advisor`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/advisor/chat` | Public / Auth | Conversational advice endpoint sending answers and receiving dynamic follow-up. |
| `POST` | `/api/advisor/recommend` | Public / Auth | Submit structured questionnaire and receive curated bundle + justification. |

### 2.5 Quote & Pricing Engine (`/api/quotes`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/quotes/calculate` | Public / Auth | Calculate exact itemized MRC, setup fees, contract discount, and 18% GST. |
| `POST` | `/api/quotes/create` | Authenticated | Persist and lock a formal quote record. Returns `quoteId`. |
| `GET` | `/api/quotes/:id` | Authenticated | Retrieve a specific quote by ID. |
| `POST` | `/api/quotes/:id/accept` | Authenticated | Formally accept quote and transition directly to checkout. |

### 2.6 Smart KYC & Document Verification (`/api/kyc`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/kyc/status` | Authenticated | Check current KYC verification stage. |
| `POST` | `/api/kyc/consent` | Authenticated | Submit DPDP Act 2023 digital consent timestamp and purpose. |
| `POST` | `/api/kyc/upload` | Authenticated | Multipart upload of document image/PDF (runs OCR extraction). |
| `POST` | `/api/kyc/verify` | Authenticated | Cross-validate extracted document identifiers against mock registry. |

### 2.7 Mock Registries (`/api/mock`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/mock/gstin/:gstin` | Public | Query mock GSTIN database for legal name, status, and address. |
| `GET` | `/api/mock/udyam/:udyam` | Public | Query mock Udyam registry for enterprise class and activity. |

### 2.8 Order Management & Lifecycle Tracker (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Customer | Create new order from accepted quote. |
| `GET` | `/api/orders` | Customer | List customer's active and historical orders. |
| `GET` | `/api/orders/:id` | Authenticated | Retrieve detailed order timeline, status, and engineer assignment. |
| `PATCH` | `/api/orders/:id/status` | Partner/Admin| Update order state machine status (`INSTALLATION_SCHEDULED`, etc.). |

### 2.9 Sales Partner & Assisted Selling (`/api/partner`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/partner/leads` | Partner/Admin| List assigned leads, abandoned quotes, and KYC exceptions. |
| `GET` | `/api/partner/leads/:id` | Partner/Admin| Retrieve single lead full dossier with drop-off diagnostic. |
| `POST` | `/api/partner/leads/:id/assist`| Partner/Admin| Execute manual verification override or resubmit documents on customer's behalf. |

### 2.10 Executive Analytics & 5,000 Lead Cohort (`/api/analytics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/overview` | Admin | Macro metrics: conversion rate, blended CAC, average activation days, MRR. |
| `GET` | `/api/analytics/funnel` | Admin | 6-stage funnel drop-off metrics (Lead $\to$ Quote $\to$ KYC $\to$ Activation). |
| `GET` | `/api/analytics/cohort` | Admin | Segment breakdowns, GSTIN disparity analysis, and city tier metrics. |

# PROJECT UDYAM DIGITAL — DATABASE SCHEMA & DATA DICTIONARY
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Platform:** Project Udyam Digital (Accel Business)  
**Database:** MongoDB with Mongoose ODM  
**Status:** Complete  

---

## 1. Entity Relationship Overview

The persistent data model is optimized for high-performance self-service onboarding, state-machine tracking, and audit compliance under the DPDP Act 2023.

```
┌─────────────────┐       1:1       ┌──────────────────┐
│      User       ├─────────────────┤ BusinessProfile  │
└────────┬────────┘                 └────────┬─────────┘
         │ 1:N                               │ 1:N
         ▼                                   ▼
┌─────────────────┐       1:1       ┌──────────────────┐
│      Quote      ├─────────────────┤      Order       │
└────────┬────────┘                 └────────┬─────────┘
         │ Contains                          │ 1:1
         ▼                                   ▼
┌─────────────────┐                 ┌──────────────────┐
│   Quote Items   │                 │   KYCDocument    │
│ (25 Catalogue)  │                 │  (OCR/Registry)  │
└─────────────────┘                 └──────────────────┘
```

---

## 2. Collections & Field Specifications

### 2.1 Collection: `users`
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique user record identifier |
| `fullName` | String | Required, Trim | Registered user's legal or trade contact name |
| `email` | String | Required, Unique, Lowercase | Primary corporate email address |
| `phone` | String | Required, Unique | 10-digit Indian mobile number (`^[6-9]\d{9}$`) |
| `password` | String | Required, Hidden (`select: false`) | Bcrypt hashed password (10 salt rounds) |
| `role` | String | Enum (`customer`, `partner`, `admin`) | Role-based authorization indicator |
| `businessProfile` | ObjectId | Ref: `BusinessProfile` | Associated business identity |
| `lastLogin` | Date | Optional | Timestamp of most recent authenticated session |
| `createdAt` / `updatedAt` | Date | Timestamps | Audit timestamps |

### 2.2 Collection: `businessprofiles`
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique profile record |
| `user` | ObjectId | Required, Ref: `User`, Indexed | Owner user reference |
| `tradeName` | String | Required | Commercial name of enterprise (e.g. Gupta Supermart) |
| `legalName` | String | Optional | Registered corporate entity name |
| `segment` | String | Enum | `Micro Retail and Services`, `Professional Offices`, etc. |
| `employees` | Number | Min: 1 | Headcount of business operations |
| `address.cityTier` | String | Enum (`Tier 1`, `Tier 2`, `Tier 3`) | Geographic eligibility classifier |
| `hasGstin` | Boolean | Default: `false` | Verified GSTIN flag |
| `gstin` | String | Uppercase, 15 chars | Indian Goods & Services Tax Identification Number |
| `hasUdyam` | Boolean | Default: `false` | Verified MSME registration flag |
| `udyamNumber` | String | Uppercase | Udyam certificate identifier |

### 2.3 Collection: `products`
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `productId` | String | Unique, Indexed | Standard product SKU (e.g. `PROD-BB-200`) |
| `productName` | String | Required | Commercial title (e.g. Accel Fiber Business 200M) |
| `category` | String | Enum | `Broadband`, `Voice/Mobile`, `Cloud`, `Security`, `IoT` |
| `speedBandwidth` | String | Optional | Technical throughput specification |
| `monthlyPrice` | Number | Required, Min: 0 | Base Monthly Recurring Charge (MRC) in INR |
| `setupFee` | Number | Min: 0 | Initial one-time provisioning & installation fee |
| `contractDurationMonths` | Number | Enum (`12`, `24`, `36`) | Mandatory lock-in contract period |
| `cityTier` | [String] | Array | Geographic tier availability array |
| `gstinRequired` | Boolean | Required | Mandatory corporate tax ID prerequisite |
| `dependencies` | [String] | Array | Prerequisite product IDs (e.g. Static IP requires BB) |

### 2.4 Collection: `quotes`
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `quoteId` | String | Unique, Indexed | Human-readable identifier (e.g. `ACCEL-Q-9812`) |
| `user` | ObjectId | Ref: `User`, Indexed | Quoted customer reference |
| `items` | Array | Array of objects | Selected items with quantities & unit MRCs |
| `baseMrc` | Number | Required | Unadjusted monthly recurring total |
| `contractDiscountPercent`| Number | 0, 5, or 10 | Term commitment discount |
| `discountedMrc` | Number | Required | Adjusted monthly charge |
| `gstMrc` | Number | Required | 18% GST on monthly charge |
| `totalMonthlyAmount` | Number | Required | Final monthly bill including taxes |
| `totalOneTimePayable` | Number | Required | First month bill + setup fees + setup GST |
| `status` | String | Enum (`DRAFT`, `ACCEPTED`, `EXPIRED`) | Quote progression lifecycle |

### 2.5 Collection: `orders`
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `orderId` | String | Unique, Indexed | Customer-facing order code (e.g. `ACCEL-ORD-4491`) |
| `quote` | ObjectId | Ref: `Quote` | Bound quote record |
| `orderStatus` | String | State Machine Enum | Current stage in provisioning lifecycle |
| `kycStatus` | String | State Machine Enum | Document verification outcome |
| `installationDetails` | Object | Nested | Site address, slot, assigned engineer credentials |
| `serviceActivation` | Object | Nested | Circuit ID, Static IP, CPE serial number, SLA health |
| `timeline` | Array | Chronological | Timestamped audit log of all status transitions |

### 2.6 Collection: `kycdocuments`
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `documentType` | String | Enum | `GST_CERTIFICATE`, `UDYAM_CERTIFICATE`, etc. |
| `filePath` | String | Secure Hash | Local/Cloudinary secure storage path |
| `ocrExtractedData` | Object | Extracted details | Raw text, parsed IDs, entity legal name |
| `registryValidation` | Object | Match results | Status in mock registry (ACTIVE / CANCELLED) |
| `verificationStatus` | String | Enum | `PENDING`, `VERIFIED`, `NEEDS_REVIEW`, `REJECTED` |

### 2.7 Collection: `leads` (5,000 Synthetic Cohort)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `leadId` | String | Unique, Indexed | Baseline lead ID (`ACCEL-LD-10001` to `15000`) |
| `businessName` | String | Required | Fictional enterprise title |
| `segment` | String | Enum | 55% Micro Retail, 25% Office, 15% Multi-site, 5% Mfg |
| `cityTier` | String | Enum (`Tier 1`, `Tier 2`, `Tier 3`) | Geographic distribution |
| `hasGstin` | Boolean | Indexed | 70.5% true, 29.5% false |
| `status` | String | Enum | `Activated` (368 total = 7.36%), `KYC Dropped`, etc. |
| `leadToActivationDays` | Number | Nullable | Average 17.6 days for activated cohort |


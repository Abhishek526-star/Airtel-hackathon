# Project Udyam Digital — Synthetic Data Specifications & Documentation
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Operator:** Accel Telecom / Accel Business (Fictional Enterprise Division)  

---

## 1. Datasets Overview

This directory contains the core datasets powering Project Udyam Digital:

| File Name | Record Count | Description | Primary Usage |
| :--- | :--- | :--- | :--- |
| `product_catalogue.csv` | 25 Products | Official B2B product catalogue across Broadband, Voice, Cloud, Security, IoT | Catalogue APIs, AI Advisor filtering, Pricing Engine |
| `mock_gstin_registry.csv` | 10 Records | Verified Indian GSTIN records with ACTIVE, CANCELLED, and SUSPENDED states | Smart KYC verification, Business verification |
| `mock_udyam_registry.csv` | 9 Records | Indian MSME Udyam registration certificates with enterprise classifications | Smart KYC verification, MSME qualification |
| `smb_leads.csv` | 5,000 Records | Quarterly lead acquisition cohort representing the case study baseline | Executive Analytics, Drop-off analysis, Business Case modeling |

---

## 2. Product Catalogue Schema (`product_catalogue.csv`)

- `product_id`: Unique identifier (e.g., `PROD-BB-100`).
- `product_name`: Commercial product title.
- `category`: `Broadband`, `Voice/Mobile`, `Cloud`, `Security`, `IoT`.
- `speed_bandwidth`: Technical specifications (e.g., `100 Mbps`, `1TB OneDrive`).
- `monthly_price`: Monthly Recurring Charge (MRC) in INR without GST.
- `setup_fee`: One-time initial setup and installation charge in INR.
- `contract_duration_months`: Standard contract lock-in period (12, 24, or 36 months).
- `city_tier`: Geographic availability (`Tier 1 / Tier 2 / Tier 3`).
- `gstin_required`: Boolean flag indicating mandatory corporate GSTIN.
- `min_employees`: Minimum headcount requirement.
- `dependencies`: Pipe-separated list of prerequisite product IDs (e.g., `PROD-BB-100|PROD-BB-200` for Static IP).
- `description`: Plain-language business utility explanation.

---

## 3. Baseline Metrics in `smb_leads.csv`

The cohort exactly replicates the case-study baseline figures:
- **Total Leads:** 5,000
- **Activated Customers:** 368 (7.36% Lead-to-Activation Conversion Rate)
- **Average Lead-to-Activation Time:** 17.6 days
- **Average Follow-up Calls:** 3 per lead
- **Blended CAC:** ₹15,000 per activated business
- **Activation Disparity:** Leads with verified GSTIN convert at 9.6% vs. 2.0% for leads without GSTIN

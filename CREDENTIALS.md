# Project Udyam Digital — User IDs & Passwords Reference Guide

> [!IMPORTANT]
> **Universal Default Password for All Pre-Seeded Accounts:**  
> `Password@123`  
> *(All accounts can be accessed using either their **Email Address** or **Phone Number** as the User ID on the [Sign In Page (`/login`)](http://localhost:5173/login).)*

---

## 1. Quick Master Credentials Matrix

| Persona Role | User Name & Enterprise Entity | Email (User ID) | Phone (Alt User ID) | Password | Assigned Circle / Scope | Target Landing Page |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MSME Customer** | **Rajesh Gupta**<br>(Gupta Supermart / Balaji Dental) | `rajesh@guptasupermart.in` | `9810123457` | `Password@123` | Delhi NCR / Kochi<br>(*Verified GSTIN & Udyam*) | [Customer Dashboard (`/dashboard`)](http://localhost:5173/dashboard) |
| **MSME Customer** | **Sneha Rao**<br>(Saffron Bakers &bull; Lead L00002) | `sneha@saffronbakers.in` | `9810123456` | `Password@123` | Ludhiana (Punjab)<br>(*Verified Active GSTIN*) | [Customer Dashboard (`/dashboard`)](http://localhost:5173/dashboard) |
| **Sales Channel Partner** | **Amit Verma**<br>(Accel Enterprise Partner) | `partner@accel.com` | `9871122334` | `Password@123` | **Delhi NCR**<br>(*Code: `CP-DEL-101`*) | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Sales Channel Partner** | **Vikram Sharma**<br>(Apex Telecom NCR Solutions) | `vikram.partner@accel.com` | `9871122335` | `Password@123` | **Delhi NCR**<br>(*Code: `CP-DEL-102`*) | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Sales Channel Partner** | **Rohit Deshmukh**<br>(Mumbai West Telecom Agency) | `rohit.mumbai@accel.com` | `9820011223` | `Password@123` | **Mumbai Metro**<br>(*Code: `CP-MUM-201`*) | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Sales Channel Partner** | **Karthik Reddy**<br>(Silicon City Enterprise Net) | `karthik.blr@accel.com` | `9845011224` | `Password@123` | **Bengaluru Urban**<br>(*Code: `CP-BLR-301`*) | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Sales Channel Partner** | **Sachin Patil**<br>(Pune Metro Digital Connect) | `sachin.pune@accel.com` | `9850011225` | `Password@123` | **Pune Hub**<br>(*Code: `CP-PUN-401`*) | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Smart KYC Partner** | **Ananya Deshmukh**<br>(Airtel SmartKYC Agency) | `kyc.partner@accel.com` | `9871122338` | `Password@123` | **Delhi NCR**<br>(*Code: `KYC-DEL-101`*) | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Smart KYC Partner** | **Rohan Joshi**<br>(Mumbai Metro SmartKYC) | `kyc.mumbai@accel.com` | `9820033445` | `Password@123` | **Mumbai Metro**<br>(*Code: `KYC-MUM-201`*) | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Smart KYC Partner** | **Kavitha Swamy**<br>(Bengaluru Digital KYC Hub) | `kyc.blr@accel.com` | `9845044556` | `Password@123` | **Bengaluru Urban**<br>(*Code: `KYC-BLR-301`*) | [Partner Portal (`/partner`)](http://localhost:5173/partner) |
| **Field Technician** | **Ramesh Kumar**<br>(Airtel Enterprise Field Engineer) | `tech.ramesh@accel.com` | `9811054321` | `Password@123` | **Delhi NCR**<br>(*Badge: `ENG-DELHI-408`*) | [Field Tasks (`/technician`)](http://localhost:5173/technician) |
| **Field Technician** | **Suresh Patil**<br>(Airtel Enterprise Field Engineer) | `tech.suresh@accel.com` | `9820054321` | `Password@123` | **Mumbai Metro**<br>(*Badge: `ENG-MUM-502`*) | [Field Tasks (`/technician`)](http://localhost:5173/technician) |
| **Field Technician** | **Ganesh Iyer**<br>(Airtel Enterprise Field Engineer) | `tech.blr@accel.com` | `9845054321` | `Password@123` | **Bengaluru Urban**<br>(*Badge: `ENG-BLR-603`*) | [Field Tasks (`/technician`)](http://localhost:5173/technician) |
| **Executive Admin** | **Priya Nair**<br>(Head of SME Growth & Digital Acq.) | `admin@accel.com` | `9988776655` | `Password@123` | **Pan-India**<br>(*All 22 Telecom Circles*) | [Executive Analytics (`/admin`)](http://localhost:5173/admin) |

---

## 2. Role-by-Role Credentials & Capabilities

### 2.1 MSME Enterprise Customers
Designed for smartphone-first micro-business owners seeking self-service telecom provisioning, digital KYC, live tracking, and monthly B2B GST tax statements.

#### Primary Account: Rajesh Gupta
- **Email / User ID:** `rajesh@guptasupermart.in`
- **Phone / User ID:** `9810123457`
- **Password:** `Password@123`
- **Business Details:** Gupta Supermart / Balaji Dental Care
- **Registered Address:** Shop 14, Main Market, Sector 18, Delhi NCR - 110001
- **Regulatory Status:** Fully verified Smart KYC with active GSTIN (`32TTNXB7384T1ZW`) and Udyam MSME Registration (`UDYAM-KL-00-3078801`).
- **Subscribed Active Services:**
  - *Biz Fibre 300* (Circuit ID: `CIR-DEL-FBR-8912`, Static IP: `103.24.188.42`, 99.8% SLA)
  - *POS Digital Gateway M2M IoT SIM* (APN: `airtelgprs.com`, 2 Active SIM lines)
  - *WhatsApp Business API Enterprise Starter* (10,000 monthly sessions)
- **Accessible Pages:**
  - [Customer Dashboard (`/dashboard`)](http://localhost:5173/dashboard) — Active services hub, optical diagnostics, and official B2B PDF invoice download.
  - [Business Profile (`/profile`)](http://localhost:5173/profile) — KYC verified badge, trade details, and edit modal.
  - [Smart KYC (`/kyc`)](http://localhost:5173/kyc) — Persistent "Smart KYC Completed & Verified" screen.

#### Secondary Account: Sneha Rao
- **Email / User ID:** `sneha@saffronbakers.in`
- **Phone / User ID:** `9810123456`
- **Password:** `Password@123`
- **Business Details:** Saffron Bakers (Proprietor Sneha Rao &bull; Lead L00002)
- **Location:** Shop 83, Market Yard, Ludhiana, Punjab - 416059
- **GSTIN:** `03PJNXS4821G1ZB` (Active Punjab GSTN)

---

### 2.2 Channel Sales Partners (Multi-Circle Network)
Empowers local telecom franchise agents and field executives with lead pipelines, live field availability controls, and assisted on-site KYC verification tools.

#### 1. Delhi NCR Circle:
- **Primary Agent:** Amit Verma
  - **Email / User ID:** `partner@accel.com`
  - **Phone / User ID:** `9871122334`
  - **Partner Code:** `CP-DEL-101`
  - **Agency Name:** Accel Enterprise Delhi Circle
- **Secondary Agent:** Vikram Sharma
  - **Email / User ID:** `vikram.partner@accel.com`
  - **Phone / User ID:** `9871122335`
  - **Partner Code:** `CP-DEL-102`
  - **Agency Name:** Apex Telecom NCR Solutions

#### 2. Mumbai Metro Circle:
- **Lead Agent:** Rohit Deshmukh
  - **Email / User ID:** `rohit.mumbai@accel.com`
  - **Phone / User ID:** `9820011223`
  - **Partner Code:** `CP-MUM-201`
  - **Agency Name:** Mumbai West Telecom Agency

#### 3. Bengaluru Urban Circle:
- **Lead Agent:** Karthik Reddy
  - **Email / User ID:** `karthik.blr@accel.com`
  - **Phone / User ID:** `9845011224`
  - **Partner Code:** `CP-BLR-301`
  - **Agency Name:** Silicon City Enterprise Net

#### 4. Pune Hub Circle:
- **Lead Agent:** Sachin Patil
  - **Email / User ID:** `sachin.pune@accel.com`
  - **Phone / User ID:** `9850011225`
  - **Partner Code:** `CP-PUN-401`
  - **Agency Name:** Pune Metro Digital Connect

**Key Partner Features Accessible:**
- [Partner Portal (`/partner`)](http://localhost:5173/partner) — Incoming customer assistance requests, unclosed lead pipeline, and in-person KYC assisted override tool.
- [Partner Profile (`/profile`)](http://localhost:5173/profile) — Partner Code badge, assigned circle, active assigned leads counter, and live availability toggle (`🟢 Online` vs `🟡 Busy in Field`).

---

### 2.3 Smart KYC Verification Partners (Assisted On-Site KYC & DPDP Compliance)
Empowers certified compliance agents to receive Smart KYC review exceptions (trade name mismatches, blurry certificates, non-standard documentation), perform on-site physical document inspections, and grant statutory verification overrides under DPDP Act 2023.

#### 1. Delhi NCR Circle:
- **Lead Smart KYC Partner:** Ananya Deshmukh
  - **Email / User ID:** `kyc.partner@accel.com`
  - **Phone / User ID:** `9871122338`
  - **Password:** `Password@123`
  - **Partner Code:** `KYC-DEL-101`
  - **Agency Name:** Airtel SmartKYC Assisted Onboarding Agency
  - **Operational Circle:** Delhi NCR
  - **Specialization:** Smart KYC On-Site Verification & DPDP Compliance

#### 2. Mumbai Metro Circle:
- **Smart KYC Partner:** Rohan Joshi
  - **Email / User ID:** `kyc.mumbai@accel.com`
  - **Phone / User ID:** `9820033445`
  - **Password:** `Password@123`
  - **Partner Code:** `KYC-MUM-201`
  - **Agency Name:** Mumbai Metro SmartKYC Agency
  - **Operational Circle:** Mumbai Metro

#### 3. Bengaluru Urban Circle:
- **Smart KYC Partner:** Kavitha Swamy
  - **Email / User ID:** `kyc.blr@accel.com`
  - **Phone / User ID:** `9845044556`
  - **Password:** `Password@123`
  - **Partner Code:** `KYC-BLR-301`
  - **Agency Name:** Bengaluru Digital KYC Hub
  - **Operational Circle:** Bengaluru Urban

**Key Smart KYC Partner Features Accessible:**
- [Partner Portal (`/partner`)](http://localhost:5173/partner) — Incoming Smart KYC review requests with OCR extracted data and discrepancy flags, click-to-call merchant, and 1-click **"Approve & Verify Smart KYC"** on-site physical override.
- [Partner Profile (`/profile`)](http://localhost:5173/profile) — Partner Code badge, assigned circle, active assigned requests counter, and live availability toggle.

---

### 2.4 Enterprise Field Technicians (Optical CPE & Line Engineers)
Empowers certified on-site field engineers to receive installation work orders, inspect commercial premises, terminate optical fiber drop cables, calibrate optical power levels, bind Nokia/Huawei ONT CPE hardware, and trigger live circuit activation.

#### 1. Delhi NCR Circle:
- **Field Engineer:** Ramesh Kumar
  - **Email / User ID:** `tech.ramesh@accel.com`
  - **Phone / User ID:** `9811054321`
  - **Password:** `Password@123`
  - **Badge ID:** `ENG-DELHI-408`
  - **Specialization:** Enterprise Fiber Splicing, GPON ONT & SD-WAN
  - **Operational Circle:** Delhi NCR

#### 2. Mumbai Metro Circle:
- **Field Engineer:** Suresh Patil
  - **Email / User ID:** `tech.suresh@accel.com`
  - **Phone / User ID:** `9820054321`
  - **Password:** `Password@123`
  - **Badge ID:** `ENG-MUM-502`
  - **Specialization:** Enterprise CPE & High-Bandwidth DIA
  - **Operational Circle:** Mumbai Metro

#### 3. Bengaluru Urban Circle:
- **Field Engineer:** Ganesh Iyer
  - **Email / User ID:** `tech.blr@accel.com`
  - **Phone / User ID:** `9845054321`
  - **Password:** `Password@123`
  - **Badge ID:** `ENG-BLR-603`
  - **Specialization:** Direct Cloud Connect & SD-WAN
  - **Operational Circle:** Bengaluru Urban

**Key Field Technician Features Accessible:**
- [Field Tasks Portal (`/technician`)](http://localhost:5173/technician) — Assigned work order queue, on-site contact details with 1-click call, optical power meter (Rx: `-19.2 dBm`), ONT serial provisioner, static IP allocator, and 1-click live activation.
- [Technician Profile (`/profile`)](http://localhost:5173/profile) — Engineer Badge ID, territory circle, and field duty mode selector (`🟢 Available`, `🟡 On Site`, `⚪ Offline`).

---

### 2.5 Executive Administration
Designed for telecom leadership and digital acquisition heads to monitor national acquisition economics and circle conversion funnels.

- **Lead Executive:** Priya Nair (Head of SME Growth & Digital Acquisition)
- **Email / User ID:** `admin@accel.com`
- **Phone / User ID:** `9988776655`
- **Password:** `Password@123`
- **Clearance Level:** Level 3 Master Operations Access (Pan-India)
- **Accessible Pages:**
  - [Executive Analytics (`/admin`)](http://localhost:5173/admin) — 5,000-lead cohort funnel, Blended CAC monitoring (₹15,000 legacy vs ₹4,200 digital), GSTIN disparity gap, drop-off root causes, and Pan-India circle conversion heatmaps.
  - [Executive Admin Profile (`/profile`)](http://localhost:5173/profile) — Master administrative credentials.

---

## 3. Specimen KYC Registry Identifiers for Testing (`/kyc`)

The platform connects to in-memory validation registries (`3,534 GSTINs` & `2,723 Udyam IDs`). You can use the following test identifiers during the **Smart KYC (`/kyc`)** flow:

| Document Type | Test Identifier | Registered Enterprise Name | Expected Test Result | Regulatory Verification Reason |
| :--- | :--- | :--- | :--- | :--- |
| **GST Certificate** | `32TTNXB7384T1ZW` | Balaji Dental Care LLP | 🟢 **PASS / VERIFIED** | Valid Active GSTIN match in national GSTN database |
| **Udyam Certificate** | `UDYAM-KL-00-3078801` | Balaji Dental | 🟢 **PASS / VERIFIED** | Registered MSME match in Ministry of MSME database |
| **GST Certificate** | `37IHKXV5167L1ZS` | Vindhya Tours | 🔴 **REJECT / FAILED** | Inactive / Cancelled GSTIN status in tax registry |
| **Address Proof** | `EXP-BILL-2026-JAN` | Commercial Utility Bill | 🔴 **REJECT / FAILED** | Utility bill date expired (> 90 days threshold) |
| **Signatory ID** | `MISMATCH-PAN-889` | Director Signatory ID | 🟡 **REVIEW / ASSISTED** | Trade name / signatory mismatch; flagged for partner assisted review |

---

## 4. How to Register New Custom Accounts

In addition to pre-configured accounts, you can register new accounts with dedicated roles on the [Registration Page (`/register`)](http://localhost:5173/register):

1. **Register as an MSME Customer**:
   - Select the **"MSME Customer"** tab.
   - Enter Full Name, Email, 10-digit Phone, Password, Business Trade Name, Industry Segment, and City Tier.
   - Automatically provisions a customer account and routes to the Customer Dashboard.
2. **Register as a Sales Channel Partner**:
   - Select the **"Channel Sales Partner"** tab.
   - Enter Agent Name, Corporate Email, Phone, Password, Franchise/Agency Name, and Assigned Telecom Circle (`Delhi NCR`, `Mumbai Metro`, etc.).
   - The system automatically assigns an official Partner Code (e.g. `CP-DEL-XXXX`) and activates the partner in the dynamic dispatch pool.

---

## 5. Testing Key Platform Scenarios

### Scenario A: Testing Dynamic Location & Availability Partner Matching
1. Sign in as **Amit Verma** (`partner@accel.com` / `Password@123`).
2. Go to **My Profile (`/profile`)** and toggle status to **"Busy in Field (Offline)"**.
3. In an incognito window, submit a field assistance request for a customer in **Delhi NCR**.
4. Observe that the request automatically routes to **Vikram Sharma** (`vikram.partner@accel.com`), who is online and available in Delhi NCR.
5. Log in as Vikram Sharma to view the incoming request in the Partner Inbox (`/partner`), accept it, and resolve it.

### Scenario B: Testing Persistent Completed KYC State
1. Sign in as **Rajesh Gupta** (`rajesh@guptasupermart.in` / `Password@123`).
2. Navigate to **Smart KYC (`/kyc`)**.
3. Notice that the page instantly displays the **"Smart KYC Completed & Verified"** screen with verified GSTIN badge, DPDP Act 2023 seal, and quick proceed buttons.
4. Check the Stepper: Step 3 displays a green checkmark indicating verified status.

### Scenario C: Testing Active Telecom Services & Diagnostics
1. Sign in as **Rajesh Gupta** (`rajesh@guptasupermart.in` / `Password@123`) and navigate to **My Business (`/dashboard`)**.
2. Browse active services filtered by **All**, **Fiber & Broadband**, **IoT & Mobility**, and **Digital SaaS**.
3. Click **"Line Diagnostics"** on Biz Fibre 300 to run an interactive optical carrier and ping latency test.
4. Click **"SLA & Specs"** to view Static IPv4 configuration and 24x7 NOC escalation hotline.
5. Click **"Download Official PDF Invoice"** to download the B2B GST tax statement vector PDF.

### Scenario D: Testing Field Technician Dynamic Assignment & Service Activation
1. Sign in as **Sneha Rao** (`sneha@saffronbakers.in` / `Password@123`) or **Rajesh Gupta** (`rajesh@guptasupermart.in`).
2. Go through the Quote Builder (`/quote`) and Checkout (`/checkout`). Place an order for on-site CPE installation in **Delhi NCR**.
3. The system dynamically queries the operational circle and assigns **Ramesh Kumar** (`ENG-DELHI-408`), linking the technician's database record to the order.
4. Sign out and sign in as **Ramesh Kumar** (`tech.ramesh@accel.com` / `Password@123`).
5. Notice automatic redirection to **Field Tasks Portal (`/technician`)**. The new order is present in Ramesh's assigned work queue with complete customer contact and site address.
6. Click **"Start On-Site Installation"** to move the task to `INSTALLATION_IN_PROGRESS`.
7. Click **"Launch Optical Diagnostics & Activate"**, inspect the simulated optical power meter (`-19.2 dBm`), verify ONT Serial (`ONT-NOKIA-XS-XXXX`), and click **"Confirm Live Activation"**.
8. Sign back in as the customer: the order tracker shows `ACTIVATED`, and the new line appears instantly under **Active Services** in **My Business (`/dashboard`)**.

### Scenario E: Testing Smart KYC Partner Assignment & On-Site Verification
1. Sign in as an MSME Customer or register a new account on `/register`.
2. Navigate to **Smart KYC (`/kyc`)**. In the test records table, click on **Director Signatory ID (Registry Name Mismatch)** with ID `MISMATCH-PAN-889`.
3. The automated OCR cross-check detects a discrepancy and flags the document as **`NEEDS_REVIEW`**.
4. The system dynamically dispatches the request to **Ananya Deshmukh** (`KYC-DEL-101`), the certified Smart KYC Partner for Delhi NCR.
5. The customer's screen immediately renders the **Assigned Smart KYC Partner Card** with Ananya's name, partner code, agency, and direct call button (`+91 9871122338`).
6. Sign out and sign in as **Ananya Deshmukh** (`kyc.partner@accel.com` / `Password@123`).
7. Open **Partner Workspace (`/partner`)**: the new request appears under **Assigned Customer Requests** tagged with the **Smart KYC Review Flag** and discrepancy notes.
8. Click **"Approve & Verify Smart KYC"**, review the physical inspection note, and confirm approval.
9. Sign back in as the customer: their `/kyc` page, business profile, and pending orders are now fully **VERIFIED**, enabling immediate order progression!




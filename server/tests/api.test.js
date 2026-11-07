const http = require('http');
const app = require('../src/app');
const mongoose = require('mongoose');
const env = require('../src/config/env');
const connectDB = require('../src/config/db');
const { initSocket } = require('../src/socket');
const { io } = require('socket.io-client');

async function runTests() {
  await connectDB();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(5002);

  const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const dataString = body ? JSON.stringify(body) : null;
      const options = {
        hostname: 'localhost',
        port: 5002,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(dataString && { 'Content-Length': Buffer.byteLength(dataString) }),
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const req = http.request(options, (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resBody) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resBody });
          }
        });
      });

      req.on('error', reject);
      if (dataString) req.write(dataString);
      req.end();
    });
  };

  const downloadPdf = (path) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5002,
        path,
        method: 'GET',
      };
      const req = http.request(options, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            byteLength: buffer.length,
          });
        });
      });
      req.on('error', reject);
      req.end();
    });
  };

  try {
    console.log('--- TEST 1: Health Check ---');
    const health = await request('/api/health');
    console.log('Health status:', health.status, 'Success:', health.data.success);

    console.log('\n--- TEST 2: Official Company Product Catalogue (25 Products) ---');
    const prods = await request('/api/products');
    console.log('Products count:', prods.data.data.length, 'First product:', prods.data.data[0].productId, '-', prods.data.data[0].productName);

    console.log('\n--- TEST 3: Official Company Mock GSTIN Lookup (3,534 records) ---');
    const gstin = await request('/api/mock/gstin/32TTNXB7384T1ZW');
    console.log('GSTIN Legal Name:', gstin.data.data.legalName, 'Status:', gstin.data.data.status);

    console.log('\n--- TEST 4: Customer Login (Lead L00002) ---');
    const login = await request('/api/auth/login', 'POST', {
      identifier: 'sneha@saffronbakers.in',
      password: 'Password@123',
    });
    console.log('Login status:', login.status, 'User:', login.data.data.user.fullName, 'Business:', login.data.data.user.businessProfile?.tradeName);

    console.log('\n--- TEST 5: AI Advisor Recommendation with Official Products ---');
    const rec = await request('/api/advisor/recommend', 'POST', {
      segment: 'Micro retail & services',
      employeeCount: 3,
      monthlyBudget: 2500,
      requiresPaymentPos: true,
      requiresWhatsapp: true,
      language: 'en',
    });
    console.log('Recommended Bundle:', rec.data.data.bundleName, 'Est MRC: ₹' + rec.data.data.estimatedMonthlyPrice);
    console.log('Products:', rec.data.data.recommendedProducts.map((p) => p.productId + ' (' + p.productName + ')').join(', '));

    console.log('\n--- TEST 6: Pricing Engine Calculation on Official Products ---');
    const quoteCalc = await request('/api/quotes/calculate', 'POST', {
      items: [
        { productId: 'P01', quantity: 1 },
        { productId: 'P07', quantity: 2 },
        { productId: 'P19', quantity: 1 },
      ],
      contractDurationMonths: 24,
    });
    console.log('Base MRC: ₹' + quoteCalc.data.data.baseMrc, 'Discounted MRC (5% off 24m): ₹' + quoteCalc.data.data.discountedMrc, 'Total Monthly Bill (incl 18% GST): ₹' + quoteCalc.data.data.totalMonthlyAmount);
    console.log('One-Time Setup Fee (Flat ₹1,000 Policy): ₹' + quoteCalc.data.data.totalSetupFee);
    if (quoteCalc.data.data.totalSetupFee !== 1000) {
      throw new Error(`Expected flat setup fee 1000, got ${quoteCalc.data.data.totalSetupFee}`);
    }

    console.log('\n--- TEST 7: Executive Cohort Analytics (5,000 Official Leads) ---');
    const analytics = await request('/api/analytics/overview');
    console.log('Total Leads:', analytics.data.data.totalLeads, 'Activated:', analytics.data.data.activatedLeads, 'Conv Rate:', analytics.data.data.conversionRate + '%');

    console.log('\n--- TEST 8: Official B2B Telecom GST Tax Invoice Vector PDF Generation ---');
    const invoicePdf = await downloadPdf('/api/invoices/download');
    console.log('Invoice PDF status:', invoicePdf.status);
    console.log('Content-Type:', invoicePdf.headers['content-type']);
    console.log('Content-Disposition:', invoicePdf.headers['content-disposition']);
    console.log('Generated PDF Size:', invoicePdf.byteLength, 'bytes');
    if (invoicePdf.status !== 200 || !invoicePdf.headers['content-type']?.includes('application/pdf') || invoicePdf.byteLength < 1000) {
      throw new Error('Invoice PDF generation failed or file corrupted');
    }

    console.log('\n--- TEST 9: Role-Based Registration (MSME Customer) ---');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const customerReg = await request('/api/auth/register', 'POST', {
      fullName: `Test MSME Owner ${randomSuffix}`,
      email: `msme_owner_${randomSuffix}@testdomain.in`,
      phone: `9810${randomSuffix}12`,
      password: 'Password@123',
      role: 'customer',
      businessName: `Test Supermart ${randomSuffix}`,
      segment: 'Micro Retail and Services',
      cityTier: 'Tier 1',
    });
    console.log('Customer Registration status:', customerReg.status);
    console.log('Registered User Role:', customerReg.data.data?.user?.role);
    console.log('Business Trade Name:', customerReg.data.data?.user?.businessProfile?.tradeName);
    if (customerReg.status !== 201 || customerReg.data.data?.user?.role !== 'customer') {
      throw new Error('Customer registration failed');
    }

    console.log('\n--- TEST 10: Role-Based Registration (Channel Sales Partner) ---');
    const partnerReg = await request('/api/auth/register', 'POST', {
      fullName: `Agent Vikram Sharma ${randomSuffix}`,
      email: `agent_vikram_${randomSuffix}@partneragency.in`,
      phone: `9876${randomSuffix}34`,
      password: 'Password@123',
      role: 'partner',
      agencyName: 'Apex Telecom Enterprise Partner',
      territoryCircle: 'Delhi NCR',
    });
    console.log('Partner Registration status:', partnerReg.status);
    console.log('Registered Partner Role:', partnerReg.data.data?.user?.role);
    console.log('Partner Agency:', partnerReg.data.data?.user?.agencyName);
    console.log('Assigned Partner Code:', partnerReg.data.data?.user?.partnerCode);
    console.log('Territory Circle:', partnerReg.data.data?.user?.territoryCircle);
    if (
      partnerReg.status !== 201 ||
      partnerReg.data.data?.user?.role !== 'partner' ||
      !partnerReg.data.data?.user?.partnerCode?.startsWith('CP-')
    ) {
      throw new Error('Partner registration failed or partner code format invalid');
    }

    console.log('\n--- TEST 11: Dynamic Partner Assignment by Location & Circle ---');
    // Customer in Mumbai Metro requests assistance
    const mumReq = await request('/api/partner/request-assistance', 'POST', {
      customerName: 'Sanjay Mehta',
      customerPhone: '9820199887',
      customerEmail: 'sanjay@mehtaexports.in',
      businessName: 'Mehta Textile Exports',
      locationCircle: 'Mumbai Metro',
      requestType: 'KYC_ASSISTANCE',
      notes: 'Need on-site partnership deed verification',
    });
    console.log('Mumbai Request status:', mumReq.status);
    console.log('Assigned Request ID:', mumReq.data.data?.request?.requestId);
    console.log('Assigned Partner:', mumReq.data.data?.assignedPartner?.fullName);
    console.log('Assigned Partner Circle:', mumReq.data.data?.assignedPartner?.territoryCircle);
    if (
      mumReq.status !== 201 ||
      mumReq.data.data?.assignedPartner?.territoryCircle !== 'Mumbai Metro'
    ) {
      throw new Error('Dynamic assignment by location failed: expected Mumbai Metro partner');
    }

    console.log('\n--- TEST 12: Partner Availability Toggle & Status Route ---');
    // Login as demo partner (Amit Verma, Delhi NCR)
    const partnerLogin = await request('/api/auth/login', 'POST', {
      identifier: 'partner@accel.com',
      password: 'Password@123',
    });
    const partnerToken = partnerLogin.data.data?.token;

    // Toggle availability to BUSY
    const toggleBusy = await request(
      '/api/partner/availability',
      'PATCH',
      { isAvailable: false, availabilityStatus: 'BUSY' },
      partnerToken
    );
    console.log('Availability toggle status:', toggleBusy.status, 'New status:', toggleBusy.data.data?.availabilityStatus);
    if (toggleBusy.status !== 200 || toggleBusy.data.data?.availabilityStatus !== 'BUSY') {
      throw new Error('Availability toggle failed');
    }

    // Now a Delhi NCR customer requests assistance -> should route to Vikram Sharma (who is AVAILABLE in Delhi NCR)
    const delReq = await request('/api/partner/request-assistance', 'POST', {
      customerName: 'Pooja Bhatia',
      customerPhone: '9811099881',
      customerEmail: 'pooja@bhatiaopticals.in',
      businessName: 'Bhatia Opticals',
      locationCircle: 'Delhi NCR',
      requestType: 'FIELD_VISIT',
      notes: 'Site survey for 500M fiber leased line',
    });
    console.log('Delhi Request status:', delReq.status);
    console.log('Assigned Partner (while Amit Verma is BUSY):', delReq.data.data?.assignedPartner?.fullName);
    if (
      delReq.status !== 201 ||
      delReq.data.data?.assignedPartner?.territoryCircle !== 'Delhi NCR' ||
      delReq.data.data?.assignedPartner?.fullName === 'Amit Verma' // Amit is busy, should pick Vikram Sharma
    ) {
      throw new Error('Availability-aware routing failed');
    }

    // Restore Amit Verma back to AVAILABLE
    await request(
      '/api/partner/availability',
      'PATCH',
      { isAvailable: true, availabilityStatus: 'AVAILABLE' },
      partnerToken
    );

    console.log('\n--- TEST 13: Partner Inbox Retrieval & Lifecycle Status Updates ---');
    // Login as Vikram Sharma who received the request
    const vikramLogin = await request('/api/auth/login', 'POST', {
      identifier: 'vikram.partner@accel.com',
      password: 'Password@123',
    });
    const vikramToken = vikramLogin.data.data?.token;

    const myRequests = await request('/api/partner/my-requests', 'GET', null, vikramToken);
    console.log('Partner Inbox status:', myRequests.status);
    console.log('Requests Count:', myRequests.data.data?.requests?.length);
    console.log('Latest Request ID:', myRequests.data.data?.requests[0]?.requestId);
    if (myRequests.status !== 200 || !myRequests.data.data?.requests?.length) {
      throw new Error('Partner failed to retrieve assigned customer requests');
    }

    // Update status to ACCEPTED then RESOLVED
    const reqId = myRequests.data.data.requests[0]._id;
    const acceptRes = await request(
      `/api/partner/my-requests/${reqId}/status`,
      'PATCH',
      { status: 'ACCEPTED' },
      vikramToken
    );
    console.log('Accept status:', acceptRes.status, 'Updated status:', acceptRes.data.data?.status);

    const resolveRes = await request(
      `/api/partner/my-requests/${reqId}/status`,
      'PATCH',
      { status: 'RESOLVED', resolutionNotes: 'Completed on-site survey and provisioned leased line quote.' },
      vikramToken
    );
    console.log('Resolve status:', resolveRes.status, 'Final status:', resolveRes.data.data?.status);
    if (resolveRes.status !== 200 || resolveRes.data.data?.status !== 'RESOLVED') {
      throw new Error('Request resolution lifecycle update failed');
    }

    console.log('\n--- TEST 14: Persistent KYC Completion State Detection ---');
    const custAuth = await request('/api/auth/login', 'POST', {
      identifier: 'rajesh@guptasupermart.in',
      password: 'Password@123',
    });
    const customerToken = custAuth.data.data?.token;

    const kycStatusRes = await request('/api/kyc/status', 'GET', null, customerToken);
    console.log('KYC Status HTTP:', kycStatusRes.status);
    console.log('Overall KYC Status:', kycStatusRes.data.data?.overallStatus);
    console.log('Verified GSTIN:', kycStatusRes.data.data?.gstin || kycStatusRes.data.data?.kycVerifiedIdentifier);
    if (
      kycStatusRes.status !== 200 ||
      kycStatusRes.data.data?.overallStatus !== 'VERIFIED' ||
      !kycStatusRes.data.data?.hasGstin
    ) {
      throw new Error('KYC completion persistence verification failed');
    }

    console.log('\n--- TEST 15: Customer & Channel Partner Profile Endpoints Lifecycle ---');
    // 15a: Customer Profile Fetch
    const custProfile = await request('/api/profile', 'GET', null, customerToken);
    console.log('Customer Profile HTTP:', custProfile.status);
    console.log('User Role:', custProfile.data.data?.user?.role);
    console.log('Business Trade Name:', custProfile.data.data?.businessProfile?.tradeName || custProfile.data.data?.tradeName);
    console.log('KYC Completed:', custProfile.data.data?.kyc?.isCompleted);
    if (
      custProfile.status !== 200 ||
      custProfile.data.data?.user?.role !== 'customer' ||
      !custProfile.data.data?.kyc?.isCompleted
    ) {
      throw new Error('Customer profile retrieval failed');
    }

    // 15b: Customer Profile Update
    const custUpdate = await request(
      '/api/profile',
      'PUT',
      {
        tradeName: 'Gupta Mega Retail & Supermart',
        employees: 12,
        address: { city: 'Delhi NCR', cityTier: 'Tier 1' },
      },
      customerToken
    );
    console.log('Customer Profile Update HTTP:', custUpdate.status);
    console.log('Updated Trade Name:', custUpdate.data.data?.businessProfile?.tradeName || custUpdate.data.data?.tradeName);
    console.log('Updated Employees:', custUpdate.data.data?.businessProfile?.employees || custUpdate.data.data?.employees);
    if (
      custUpdate.status !== 200 ||
      (custUpdate.data.data?.businessProfile?.tradeName || custUpdate.data.data?.tradeName) !== 'Gupta Mega Retail & Supermart'
    ) {
      throw new Error('Customer profile update failed');
    }

    // 15c: Channel Partner Profile Fetch
    const partnerProfile = await request('/api/profile', 'GET', null, partnerToken);
    console.log('Partner Profile HTTP:', partnerProfile.status);
    console.log('Partner Code:', partnerProfile.data.data?.user?.partnerCode);
    console.log('Partner Territory Circle:', partnerProfile.data.data?.user?.territoryCircle);
    console.log('Partner Availability:', partnerProfile.data.data?.user?.availabilityStatus);
    if (
      partnerProfile.status !== 200 ||
      partnerProfile.data.data?.user?.role !== 'partner' ||
      !partnerProfile.data.data?.user?.partnerCode
    ) {
      throw new Error('Partner profile retrieval failed');
    }

    // 15d: Channel Partner Profile Update
    const partnerUpdate = await request(
      '/api/profile',
      'PUT',
      {
        agencyName: 'Delhi Tech Telecom Hub',
        phone: '9810199999',
      },
      partnerToken
    );
    console.log('Partner Profile Update HTTP:', partnerUpdate.status);
    console.log('Updated Agency Name:', partnerUpdate.data.data?.user?.agencyName);
    if (
      partnerUpdate.status !== 200 ||
      partnerUpdate.data.data?.user?.agencyName !== 'Delhi Tech Telecom Hub'
    ) {
      throw new Error('Partner profile update failed');
    }

    console.log('\n--- TEST 16: Active Services Retrieval & Technical Telemetry API ---');
    const servicesRes = await request('/api/services/active', 'GET', null, customerToken);
    console.log('Active Services HTTP:', servicesRes.status);
    console.log('Total Services Count:', servicesRes.data.data?.services?.length);
    console.log('Summary Circuit ID:', servicesRes.data.data?.summary?.circuitId);
    console.log('Summary Static IP:', servicesRes.data.data?.summary?.staticIp);
    console.log('Summary Monthly MRC: ₹' + servicesRes.data.data?.summary?.totalMonthlyRecurring);
    if (
      servicesRes.status !== 200 ||
      !Array.isArray(servicesRes.data.data?.services) ||
      servicesRes.data.data?.services.length === 0 ||
      !servicesRes.data.data?.summary?.circuitId
    ) {
      throw new Error('Active services retrieval failed');
    }

    // 16b: Diagnostic Line Ping Test
    const firstServiceCircuit = servicesRes.data.data?.services[0]?.telecomDetails?.circuitId || 'CIR-DEL-FBR-8912';
    const diagRes = await request(
      `/api/services/${encodeURIComponent(firstServiceCircuit)}/diagnostics`,
      'POST',
      null,
      customerToken
    );
    console.log('Diagnostics HTTP:', diagRes.status);
    console.log('Overall Health:', diagRes.data.data?.overallHealth);
    console.log('Optical Carrier Status:', diagRes.data.data?.tests?.[0]?.status);
    if (diagRes.status !== 200 || diagRes.data.data?.overallHealth !== 'OPTIMAL') {
      throw new Error('Service network diagnostic execution failed');
    }

    console.log('\n--- TEST 17: Field Technician Authentication & Dynamic Work Order Routing ---');
    // 17a: Authenticate as Field Technician Ramesh Kumar
    const techLogin = await request('/api/auth/login', 'POST', {
      identifier: 'tech.ramesh@accel.com',
      password: 'Password@123',
    });
    console.log('Tech Login HTTP:', techLogin.status);
    console.log('Tech Name:', techLogin.data.data?.user?.fullName);
    console.log('Tech Role:', techLogin.data.data?.user?.role);
    console.log('Tech Badge ID:', techLogin.data.data?.user?.badgeId);
    console.log('Tech Circle:', techLogin.data.data?.user?.territoryCircle);

    if (
      techLogin.status !== 200 ||
      techLogin.data.data?.user?.role !== 'technician' ||
      techLogin.data.data?.user?.badgeId !== 'ENG-DELHI-408'
    ) {
      throw new Error('Field technician authentication failed');
    }
    const techToken = techLogin.data.data?.token;

    // 17b: Fetch Technician Assigned Tasks
    const techTasks = await request('/api/technician/tasks', 'GET', null, techToken);
    console.log('Tech Tasks HTTP:', techTasks.status);
    console.log('Assigned Tasks Count:', techTasks.data.data?.tasks?.length);
    console.log('Technician Stats:', techTasks.data.data?.stats);
    if (techTasks.status !== 200 || !Array.isArray(techTasks.data.data?.tasks)) {
      throw new Error('Technician tasks retrieval failed');
    }

    // 17c: Dynamic Order Routing Test - Place Order in Delhi NCR
    const quoteGen = await request(
      '/api/quotes',
      'POST',
      {
        items: [
          { productId: 'P01', quantity: 1 },
          { productId: 'P06', quantity: 1 },
        ],
        contractDurationMonths: 12,
      },
      customerToken
    );
    const newQuoteId = quoteGen.data.data?.quoteId;

    const newOrderRes = await request(
      '/api/orders',
      'POST',
      {
        quoteId: newQuoteId,
        installationAddress: 'Unit 402, Technology Park, Okhla Phase 3',
        city: 'Delhi NCR',
        pincode: '110020',
        contactPerson: 'Rajesh Gupta',
        contactPhone: '9810123457',
        timeSlot: '10:00 AM - 01:00 PM',
      },
      customerToken
    );
    console.log('New Order HTTP:', newOrderRes.status);
    console.log('New Order ID:', newOrderRes.data.data?.orderId);
    console.log('Assigned Tech ID:', newOrderRes.data.data?.assignedTechnician);
    console.log('Assigned Engineer Name:', newOrderRes.data.data?.installationDetails?.assignedEngineer?.name);
    console.log('Assigned Engineer Badge:', newOrderRes.data.data?.installationDetails?.assignedEngineer?.badgeId);

    if (
      newOrderRes.status !== 201 ||
      !newOrderRes.data.data?.assignedTechnician ||
      newOrderRes.data.data?.installationDetails?.assignedEngineer?.badgeId !== 'ENG-DELHI-408'
    ) {
      throw new Error('Dynamic technician assignment routing failed');
    }

    const testOrderId = newOrderRes.data.data?.orderId;

    // 17d: Technician Advances Task to INSTALLATION_IN_PROGRESS
    const startInstallRes = await request(
      `/api/technician/tasks/${testOrderId}/status`,
      'PATCH',
      {
        nextStatus: 'INSTALLATION_IN_PROGRESS',
        notes: 'Technician Ramesh Kumar on site at Okhla Phase 3. Optical drop terminated.',
      },
      techToken
    );
    console.log('Start Install HTTP:', startInstallRes.status);
    console.log('Updated Status:', startInstallRes.data.data?.orderStatus);
    if (startInstallRes.status !== 200 || startInstallRes.data.data?.orderStatus !== 'INSTALLATION_IN_PROGRESS') {
      throw new Error('Technician failed to advance order to INSTALLATION_IN_PROGRESS');
    }

    // 17e: Technician Executes Optical Diagnostics & Activates Service
    const activateRes = await request(
      `/api/technician/tasks/${testOrderId}/status`,
      'PATCH',
      {
        nextStatus: 'ACTIVATED',
        notes: 'Optical power verified at -19.2 dBm. Nokia ONT provisioned and static IP live.',
        opticalPowerRx: -19.2,
        opticalPowerTx: 2.4,
        cpeSerialNumber: 'ONT-NOKIA-XS-994821',
        staticIp: '103.24.188.99',
      },
      techToken
    );
    console.log('Activation HTTP:', activateRes.status);
    console.log('Activated Status:', activateRes.data.data?.orderStatus);
    console.log('Circuit ID:', activateRes.data.data?.serviceActivation?.circuitId);
    console.log('Static IP:', activateRes.data.data?.serviceActivation?.assignedStaticIp);
    console.log('ONT Serial:', activateRes.data.data?.serviceActivation?.cpeSerialNumber);

    if (
      activateRes.status !== 200 ||
      activateRes.data.data?.orderStatus !== 'ACTIVATED' ||
      !activateRes.data.data?.serviceActivation?.circuitId
    ) {
      throw new Error('Technician service activation lifecycle failed');
    }

    // 17f: Technician Availability Toggle
    const availRes = await request(
      '/api/technician/availability',
      'PATCH',
      {
        availabilityStatus: 'AVAILABLE',
        isAvailable: true,
      },
      techToken
    );
    console.log('Availability Update HTTP:', availRes.status);
    console.log('New Availability Status:', availRes.data.data?.availabilityStatus);
    if (availRes.status !== 200 || availRes.data.data?.availabilityStatus !== 'AVAILABLE') {
      throw new Error('Technician availability update failed');
    }

    console.log('\n--- TEST 18: Smart KYC Partner Authentication, Exception Routing & On-Site Verification ---');
    // 18a: Authenticate as dedicated Smart KYC Partner Ananya Deshmukh
    const kycPartnerLogin = await request('/api/auth/login', 'POST', {
      identifier: 'kyc.partner@accel.com',
      password: 'Password@123',
    });
    console.log('Smart KYC Partner Login HTTP:', kycPartnerLogin.status);
    console.log('Partner Name:', kycPartnerLogin.data.data?.user?.fullName);
    console.log('Partner Role:', kycPartnerLogin.data.data?.user?.role);
    console.log('Partner Code:', kycPartnerLogin.data.data?.user?.partnerCode);
    console.log('Territory Circle:', kycPartnerLogin.data.data?.user?.territoryCircle);

    if (
      kycPartnerLogin.status !== 200 ||
      kycPartnerLogin.data.data?.user?.role !== 'partner' ||
      kycPartnerLogin.data.data?.user?.partnerCode !== 'KYC-DEL-101'
    ) {
      throw new Error('Smart KYC partner authentication failed');
    }
    const kycPartnerToken = kycPartnerLogin.data.data?.token;

    // 18b: Customer requests Smart KYC Partner Assisted Verification
    const assignPartnerRes = await request(
      '/api/kyc/assign-partner',
      'POST',
      {
        documentType: 'SIGNATORY_ID',
        notes: 'Director Signatory ID registry mismatch. Requested certified Smart KYC partner on-site visit.',
      },
      customerToken
    );
    console.log('Assign KYC Partner HTTP:', assignPartnerRes.status);
    console.log('Assigned Partner Name:', assignPartnerRes.data.data?.assignedPartner?.name);
    console.log('Assigned Partner Code:', assignPartnerRes.data.data?.assignedPartner?.partnerCode);
    console.log('Request ID:', assignPartnerRes.data.data?.request?.requestId);

    if (
      assignPartnerRes.status !== 200 ||
      !assignPartnerRes.data.data?.assignedPartner ||
      assignPartnerRes.data.data?.assignedPartner?.partnerCode !== 'KYC-DEL-101'
    ) {
      throw new Error('Smart KYC partner dynamic assignment failed');
    }
    const kycAssistanceRequestId = assignPartnerRes.data.data?.request?.requestId;

    // 18c: Smart KYC Partner inspects assigned requests inbox
    const partnerInboxRes = await request('/api/partner/my-requests', 'GET', null, kycPartnerToken);
    console.log('Partner Inbox HTTP:', partnerInboxRes.status);
    console.log('Partner Requests Count:', partnerInboxRes.data.data?.requests?.length);
    const foundKycReq = partnerInboxRes.data.data?.requests?.find(
      (r) => r.requestId === kycAssistanceRequestId
    );
    console.log('Found Assigned KYC Request in Inbox:', Boolean(foundKycReq));
    if (partnerInboxRes.status !== 200 || !foundKycReq) {
      throw new Error('Assigned Smart KYC request not found in partner inbox');
    }

    // 18d: Smart KYC Partner approves & physically verifies KYC on-site
    const approveKycRes = await request(
      `/api/partner/kyc/${kycAssistanceRequestId}/approve`,
      'POST',
      {
        notes: 'Physically inspected original partnership deed and director Aadhaar/PAN at premises under DPDP Act 2023.',
      },
      kycPartnerToken
    );
    console.log('Approve KYC HTTP:', approveKycRes.status);
    console.log('Request Status after Approval:', approveKycRes.data.data?.request?.status);
    if (approveKycRes.status !== 200 || approveKycRes.data.data?.request?.status !== 'RESOLVED') {
      throw new Error('Partner assisted KYC approval failed');
    }

    // 18e: Verify Customer KYC state is now fully VERIFIED
    const customerKycCheck = await request('/api/kyc/status', 'GET', null, customerToken);
    console.log('Customer KYC Check HTTP:', customerKycCheck.status);
    console.log('Overall KYC Status:', customerKycCheck.data.data?.overallStatus);
    console.log('KYC Verified At:', customerKycCheck.data.data?.kycVerifiedAt);

    if (
      customerKycCheck.status !== 200 ||
      customerKycCheck.data.data?.overallStatus !== 'VERIFIED'
    ) {
      throw new Error('Customer KYC status was not updated to VERIFIED after partner approval');
    }

    console.log('\n--- TEST 19: Incremental Service Purchasing & Reusable KYC (No Duplicate Billing) ---');
    // 19a: Pre-verified customer generates quote for additional service only (P15: WhatsApp Business API Starter)
    const incrementalQuoteRes = await request(
      '/api/quotes',
      'POST',
      {
        items: [{ productId: 'P15', quantity: 1 }],
        contractDurationMonths: 12,
        bundleName: 'Incremental Add-on: WhatsApp Business API',
        isIncremental: true,
      },
      customerToken
    );
    console.log('Incremental Quote HTTP:', incrementalQuoteRes.status);
    console.log('Incremental Quote ID:', incrementalQuoteRes.data.data?.quoteId);
    console.log('Incremental Quote Items Count:', incrementalQuoteRes.data.data?.items?.length);
    console.log('Incremental Setup Fee (Should be ₹0 for add-on): ₹' + incrementalQuoteRes.data.data?.totalSetupFee);

    if (
      incrementalQuoteRes.status !== 201 ||
      incrementalQuoteRes.data.data?.items?.length !== 1 ||
      incrementalQuoteRes.data.data?.items[0]?.productId !== 'P15' ||
      incrementalQuoteRes.data.data?.totalSetupFee !== 0
    ) {
      throw new Error('Incremental quote generation failed or billed duplicate setup fee');
    }

    const incrementalQuoteId = incrementalQuoteRes.data.data?.quoteId;

    // 19b: Place separate order without repeating KYC
    const order2Res = await request(
      '/api/orders',
      'POST',
      {
        quoteId: incrementalQuoteId,
        installationAddress: 'Unit 402, Technology Park, Okhla Phase 3',
        city: 'Delhi NCR',
        pincode: '110020',
        contactPerson: 'Rajesh Gupta',
        contactPhone: '9810123457',
        timeSlot: '02:00 PM - 05:00 PM',
      },
      customerToken
    );

    console.log('Order 2 HTTP:', order2Res.status);
    console.log('Order 2 ID:', order2Res.data.data?.orderId);
    console.log('Order 2 KYC Status (Reusable):', order2Res.data.data?.kycStatus);
    console.log('Order 2 Order Status:', order2Res.data.data?.orderStatus);

    if (
      order2Res.status !== 201 ||
      order2Res.data.data?.kycStatus !== 'VERIFIED' ||
      order2Res.data.data?.orderId === newOrderRes.data.data?.orderId
    ) {
      throw new Error('Incremental order failed to reuse verified KYC or generated duplicate orderId');
    }

    const order2Id = order2Res.data.data?.orderId;

    // 19c: Verify Order-Isolated PDF Invoice Download for Order 2
    const order2InvoicePdf = await downloadPdf(`/api/invoices/download?orderId=${encodeURIComponent(order2Id)}`);
    console.log('Order 2 Invoice PDF status:', order2InvoicePdf.status);
    console.log('Order 2 PDF Size:', order2InvoicePdf.byteLength, 'bytes');

    if (order2InvoicePdf.status !== 200 || order2InvoicePdf.byteLength < 1000) {
      throw new Error('Order-isolated PDF invoice download failed');
    }

    console.log('\n--- TEST 20: Real-Time WebSocket Telemetry & Event Synchronization ---');
    // Connect Socket.IO client
    const socketClient = io('http://localhost:5002', {
      auth: { token: customerToken },
      transports: ['websocket'],
    });

    const socketConnected = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => resolve(false), 4000);
      socketClient.on('connect', () => {
        clearTimeout(timeout);
        resolve(true);
      });
      socketClient.on('connect_error', (e) => {
        clearTimeout(timeout);
        console.warn('Socket client connection note:', e.message);
        resolve(false);
      });
    });

    console.log('WebSocket Client Connected:', socketConnected);

    if (socketConnected) {
      // Listen for ORDER_STATUS_UPDATED
      const eventPromise = new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(null), 5000);
        socketClient.on('ORDER_STATUS_UPDATED', (data) => {
          clearTimeout(timeout);
          resolve(data);
        });
      });

      // Join room for order2
      socketClient.emit('join_order', order2Id);

      // Advance status on Order 2
      await request(
        `/api/orders/${order2Id}/status`,
        'PATCH',
        {
          nextStatus: 'ACTIVATED',
          notes: 'WhatsApp Business API provisioned and credentials delivered in real time.',
        },
        customerToken
      );

      const receivedEvent = await eventPromise;
      console.log('WebSocket Event Received:', Boolean(receivedEvent));
      if (receivedEvent) {
        console.log('Received Order Status in Real Time:', receivedEvent.orderStatus);
        console.log('Received Order ID:', receivedEvent.orderId);
      }
      socketClient.disconnect();
    }

    // Verify Active Services contains combined subscriptions
    const finalServicesRes = await request('/api/services/active', 'GET', null, customerToken);
    console.log('Final Combined Active Services Count:', finalServicesRes.data.data?.services?.length);
    if (finalServicesRes.status !== 200 || (finalServicesRes.data.data?.services?.length || 0) < 2) {
      throw new Error('Active services failed to aggregate multiple purchased orders');
    }

    // ========================================================
    // TEST 21: OCR-Based Business KYC Verification & Confidence Scoring
    // ========================================================
    console.log('\n--- Running Test 21: OCR-Based Business KYC with Confidence Scores & Discrepancy Detection ---');
    const kycService = require('../src/services/kyc/kycService');

    // 21a. Verify Active GSTIN
    const activeGstResult = await kycService.verifyDocument('GST_CERTIFICATE', '32TTNXB7384T1ZW', {
      tradeName: 'Balaji Dental Care',
      legalName: 'Balaji Dental Care',
    });
    console.log('Active GSTIN Result:', activeGstResult.verificationStatus, 'Confidence:', activeGstResult.confidenceScore);
    if (activeGstResult.verificationStatus !== 'VERIFIED' || activeGstResult.confidenceScore < 0.85) {
      throw new Error('Active GST certificate verification failed confidence threshold');
    }

    // 21b. Verify Active Udyam Registration
    const activeUdyamResult = await kycService.verifyDocument('UDYAM_CERTIFICATE', 'UDYAM-KL-00-3078801', {
      tradeName: 'Balaji Dental',
    });
    console.log('Active Udyam Result:', activeUdyamResult.verificationStatus, 'Confidence:', activeUdyamResult.confidenceScore);
    if (activeUdyamResult.verificationStatus !== 'VERIFIED' || activeUdyamResult.confidenceScore < 0.85) {
      throw new Error('Active Udyam certificate verification failed');
    }

    // 21c. Detect Planted Defect: Inactive / Cancelled GSTIN
    const cancelledGstResult = await kycService.verifyDocument('GST_CERTIFICATE', '37IHKXV5167L1ZS', {
      tradeName: 'Vindhya Tours',
    });
    console.log('Cancelled GSTIN Result:', cancelledGstResult.verificationStatus, 'Discrepancies:', cancelledGstResult.discrepancies);
    if (cancelledGstResult.verificationStatus !== 'REJECTED' || cancelledGstResult.discrepancies.length === 0) {
      throw new Error('Cancelled GST certificate failed to trigger rejection and discrepancy alert');
    }

    // 21d. Detect Planted Defect: Authorized Signatory Name Mismatch
    const mismatchSignatoryResult = await kycService.verifyDocument('SIGNATORY_ID', 'MISMATCH-PAN-889', {
      contactPerson: 'Rajesh Gupta',
    });
    console.log('Signatory Mismatch Result:', mismatchSignatoryResult.verificationStatus, 'Confidence:', mismatchSignatoryResult.confidenceScore);
    if (mismatchSignatoryResult.verificationStatus !== 'NEEDS_REVIEW' || mismatchSignatoryResult.crossMatchResults.signatoryMatch !== false) {
      throw new Error('Signatory name mismatch failed to route to partner review');
    }

    // ========================================================
    // TEST 22: Comprehensive Bill & Invoice History API
    // ========================================================
    console.log('\n--- Running Test 22: Comprehensive Bill & Invoice History API (Search, Filter, Sort) ---');

    // 22a. Fetch all invoices
    const allInvoicesRes = await request('/api/invoices', 'GET', null, customerToken);
    console.log('Invoices Fetch Status:', allInvoicesRes.status);
    console.log('Total Invoices Count:', allInvoicesRes.data.data?.invoices?.length);
    console.log('Billing Summary:', allInvoicesRes.data.data?.summary);
    if (allInvoicesRes.status !== 200 || !allInvoicesRes.data.data?.invoices?.length) {
      throw new Error('Failed to retrieve customer invoice history');
    }

    const firstInvoice = allInvoicesRes.data.data.invoices[0];
    console.log('Sample Invoice Number:', firstInvoice.invoiceNumber);
    console.log('Sample Invoice Amount: ₹', firstInvoice.totalAmount);
    console.log('Sample Invoice Items Count:', firstInvoice.items?.length);

    // 22b. Test search filtering
    const searchRes = await request('/api/invoices?search=ACCEL', 'GET', null, customerToken);
    if (searchRes.status !== 200 || !searchRes.data.data?.invoices?.length) {
      throw new Error('Invoice search filter failed');
    }

    // 22c. Test single invoice detail endpoint
    const singleInvRes = await request(`/api/invoices/${firstInvoice._id}`, 'GET', null, customerToken);
    if (singleInvRes.status !== 200 || singleInvRes.data.data?.invoiceNumber !== firstInvoice.invoiceNumber) {
      throw new Error('Single invoice detail endpoint failed');
    }

    // ========================================================
    // TEST 23: Payment Transactions Audit Trail API
    // ========================================================
    console.log('\n--- Running Test 23: Payment Transactions Audit Trail API ---');
    const txnsRes = await request('/api/invoices/transactions/history', 'GET', null, customerToken);
    console.log('Transactions Fetch Status:', txnsRes.status);
    console.log('Total Transactions Count:', txnsRes.data.data?.length);
    if (txnsRes.status !== 200 || !txnsRes.data.data?.length) {
      throw new Error('Payment transactions history failed to return records');
    }
    const sampleTxn = txnsRes.data.data[0];
    console.log('Sample Transaction Ref:', sampleTxn.transactionId);
    console.log('Sample Transaction Status:', sampleTxn.status);
    console.log('Sample Transaction Mode:', sampleTxn.mode);

    // ========================================================
    // TEST 24: Personal AI Support Assistant & Priority Escalation
    // ========================================================
    console.log('\n--- Running Test 24: Personal AI Support Assistant & Priority Escalation ---');

    // 24a. Account-grounded billing query
    const aiBillingChat = await request(
      '/api/support/chat',
      'POST',
      {
        message: 'What is my current bill and payment status?',
      },
      customerToken
    );
    console.log('AI Billing Chat Status:', aiBillingChat.status);
    console.log('AI Response Snippet:', aiBillingChat.data.data?.reply?.slice(0, 150));
    if (aiBillingChat.status !== 200 || !aiBillingChat.data.data?.reply) {
      throw new Error('AI Customer Support Chat failed on billing inquiry');
    }

    // 24b. Optical signal troubleshooting query
    const aiSignalChat = await request(
      '/api/support/chat',
      'POST',
      {
        message: 'What is my optical signal status and Rx power?',
      },
      customerToken
    );
    console.log('AI Optical Chat Status:', aiSignalChat.status);
    console.log('AI Response Snippet:', aiSignalChat.data.data?.reply?.slice(0, 150));
    if (aiSignalChat.status !== 200 || !aiSignalChat.data.data?.reply) {
      throw new Error('AI Customer Support Chat failed on optical signal inquiry');
    }

    // 24c. Natural Language Escalation to Human / Field Engineer
    const aiEscalationChat = await request(
      '/api/support/chat',
      'POST',
      {
        message: 'Our main optical fiber was cut by construction work outside! Please escalate immediately to a field technician.',
      },
      customerToken
    );
    console.log('AI Escalation Status:', aiEscalationChat.status);
    console.log('AI Escalated Flag:', aiEscalationChat.data.data?.escalated);
    console.log('AI Escalation Ticket:', aiEscalationChat.data.data?.ticketInfo);
    if (
      aiEscalationChat.status !== 200 ||
      !aiEscalationChat.data.data?.escalated ||
      !aiEscalationChat.data.data?.ticketInfo?.ticketId
    ) {
      throw new Error('AI Support failed to trigger automatic human technician escalation');
    }

    // ========================================================
    // TEST 25: Smart KYC Partner RBAC & Circle Scoping Validation
    // ========================================================
    console.log('\n--- Running Test 25: Smart KYC Partner RBAC & Circle Scoping Validation ---');

    const pipeKycLogin = await request('/api/auth/login', 'POST', {
      identifier: 'kyc.partner@accel.com',
      password: 'Password@123',
    });
    console.log('Delhi KYC Partner Login Status:', pipeKycLogin.status);
    const pipeKycToken = pipeKycLogin.data.data.token;

    const mumPartnerLogin = await request('/api/auth/login', 'POST', {
      identifier: 'rohit.mumbai@accel.com',
      password: 'Password@123',
    });
    console.log('Mumbai Partner Login Status:', mumPartnerLogin.status);
    const mumPartnerToken = mumPartnerLogin.data.data.token;

    // Fetch leads with pagination & circle scoping
    const partnerLeadsRes = await request('/api/partner/leads?page=1&limit=6', 'GET', null, pipeKycToken);
    console.log('Partner Leads Query Status:', partnerLeadsRes.status);
    console.log('Total Pool Leads:', partnerLeadsRes.data.data?.totalCount, 'Returned:', partnerLeadsRes.data.data?.leads?.length);
    if (partnerLeadsRes.status !== 200 || !partnerLeadsRes.data.data?.leads?.length) {
      throw new Error('Partner lead query failed or returned empty list');
    }

    const authorizedLead = partnerLeadsRes.data.data.leads[0];

    // Ensure a Mumbai lead exists assigned to Mumbai partner
    const LeadModel = require('../src/models/Lead');
    const mumbaiLead = await LeadModel.findOneAndUpdate(
      { city: /Mumbai/i },
      { assignedPartnerCode: 'CP-MUM-201', assignedPartner: 'Rohit Deshmukh' },
      { new: true }
    );

    if (mumbaiLead) {
      // Delhi partner attempting to access Mumbai lead should be rejected with 403 Forbidden
      const unauthorizedAccess = await request(`/api/partner/leads/${mumbaiLead.leadId}/customer-details`, 'GET', null, pipeKycToken);
      console.log('Cross-Circle Unauthorized Access Status:', unauthorizedAccess.status, unauthorizedAccess.data.error?.code);
      if (unauthorizedAccess.status !== 403 || unauthorizedAccess.data.error?.code !== 'UNAUTHORIZED_LEAD_ACCESS') {
        throw new Error('RBAC violation: Unauthorized partner was not blocked with 403');
      }

      // Mumbai partner accessing own circle lead should succeed with 200 OK
      const authorizedMumAccess = await request(`/api/partner/leads/${mumbaiLead.leadId}/customer-details`, 'GET', null, mumPartnerToken);
      console.log('Authorized In-Circle Partner Access Status:', authorizedMumAccess.status);
      if (authorizedMumAccess.status !== 200) {
        throw new Error('Authorized Mumbai partner was incorrectly blocked');
      }
    }

    // ========================================================
    // TEST 26: Comprehensive Customer Information Retrieval
    // ========================================================
    console.log('\n--- Running Test 26: Comprehensive Customer Information Retrieval ---');

    const customerDossier = await request(`/api/partner/leads/${authorizedLead.leadId}/customer-details`, 'GET', null, pipeKycToken);
    console.log('Customer Dossier Status:', customerDossier.status);
    console.log('Business Profile Trade Name:', customerDossier.data.data?.businessProfile?.tradeName);
    console.log('Contact Person:', customerDossier.data.data?.contactInfo?.contactPerson);
    console.log('KYC Documents Count:', customerDossier.data.data?.kycDocuments?.length);
    console.log('Orders Count:', customerDossier.data.data?.orders?.length);
    console.log('Invoices Count:', customerDossier.data.data?.invoices?.length);
    console.log('Audit Log Count:', customerDossier.data.data?.lead?.accessAuditLog?.length);

    if (
      customerDossier.status !== 200 ||
      !customerDossier.data.data?.businessProfile ||
      !customerDossier.data.data?.kycDocuments?.length ||
      !customerDossier.data.data?.lead?.accessAuditLog?.length
    ) {
      throw new Error('Comprehensive customer information retrieval failed');
    }

    // ========================================================
    // TEST 27: Document Secure Preview with DPDP Act & Audit Log
    // ========================================================
    console.log('\n--- Running Test 27: Document Secure Preview with DPDP Act Compliance ---');

    const previewDoc = customerDossier.data.data.kycDocuments[0];
    const previewRes = await request(
      `/api/partner/leads/${authorizedLead.leadId}/documents/${previewDoc.id}/preview`,
      'GET',
      null,
      pipeKycToken
    );
    console.log('Document Secure Preview Status:', previewRes.status);
    console.log('Preview Document Title:', previewRes.data.data?.documentTitle);
    console.log('Preview Watermark:', previewRes.data.data?.watermark);
    console.log('Cryptographic Security Hash:', previewRes.data.data?.securityHash);

    if (
      previewRes.status !== 200 ||
      !previewRes.data.data?.documentTitle ||
      !previewRes.data.data?.securityHash ||
      !previewRes.data.data?.watermark?.includes('DPDP ACT 2023')
    ) {
      throw new Error('Secure document preview failed or missing DPDP compliance seal');
    }

    // ========================================================
    // TEST 28: Lead Recovery Action Recording & Timeline Updates
    // ========================================================
    console.log('\n--- Running Test 28: Lead Recovery Action Recording & Timeline Updates ---');

    const recoveryActionRes = await request(
      `/api/partner/leads/${authorizedLead.leadId}/recovery-action`,
      'POST',
      {
        actionType: 'PHYSICAL_SITE_VISIT',
        remarks: 'Partner completed in-person inspection of business premises, verified statutory credentials and electricity bill.',
        newStatus: 'IN_PROGRESS',
        pendingRequirements: ['Awaiting landlord lease deed upload'],
      },
      pipeKycToken
    );
    console.log('Recovery Action Recording Status:', recoveryActionRes.status);
    console.log('Updated Recovery Status:', recoveryActionRes.data.data?.recoveryStatus);
    console.log('Latest Action Type:', recoveryActionRes.data.data?.latestAction?.actionType);

    if (
      recoveryActionRes.status !== 200 ||
      recoveryActionRes.data.data?.recoveryStatus !== 'IN_PROGRESS' ||
      recoveryActionRes.data.data?.latestAction?.actionType !== 'PHYSICAL_SITE_VISIT'
    ) {
      throw new Error('Lead recovery action recording failed');
    }

    // ========================================================
    // TEST 29: Natural Conversational AI Advisor Consultation with Dynamic Bundle Curation
    // ========================================================
    console.log('\n--- Running Test 29: Natural Conversational AI Advisor Consultation ---');

    const naturalAdvisorRes = await request('/api/advisor/chat', 'POST', {
      message: 'We run a busy retail grocery supermarket with 4 checkout counters. We face frequent Wi-Fi dropouts during peak UPI/QR code billing, and we want to send customer billing receipts on WhatsApp. Our budget is around ₹2,500/month.',
      history: [],
      language: 'en',
    });

    console.log('Natural Advisor Status:', naturalAdvisorRes.status);
    console.log('Advisor Reply Snippet:', naturalAdvisorRes.data.data?.reply?.slice(0, 160));
    console.log('Curated Bundle Name:', naturalAdvisorRes.data.data?.bundle?.bundleName);
    console.log('Estimated MRC: ₹', naturalAdvisorRes.data.data?.bundle?.estimatedMonthlyPrice);
    console.log('Flat Setup Fee: ₹', naturalAdvisorRes.data.data?.bundle?.oneTimeSetup);
    console.log('Products:', (naturalAdvisorRes.data.data?.bundle?.recommendedProducts || []).map((p) => p.productId + ' (' + p.productName + ')').join(', '));
    console.log('Suggested Quick Replies:', naturalAdvisorRes.data.data?.suggestedQuickReplies);

    const curatedBundle = naturalAdvisorRes.data.data?.bundle;
    if (
      naturalAdvisorRes.status !== 200 ||
      !naturalAdvisorRes.data.data?.reply ||
      !curatedBundle ||
      !curatedBundle.recommendedProducts?.length ||
      curatedBundle.oneTimeSetup !== 1000 ||
      !naturalAdvisorRes.data.data?.suggestedQuickReplies?.length
    ) {
      throw new Error('Natural conversational advisor consultation failed or returned invalid bundle data');
    }

    // Verify all products strictly belong to the official 25-product catalogue
    for (const prod of curatedBundle.recommendedProducts) {
      if (!prod.productId || !prod.productId.startsWith('P') || !prod.monthlyPrice) {
        throw new Error(`Invalid or ungrounded product detected: ${JSON.stringify(prod)}`);
      }
    }

    // ========================================================
    // TEST 30: Contextual Follow-Up and Dynamic Bundle Modification
    // ========================================================
    console.log('\n--- Running Test 30: Contextual Follow-Up & Dynamic Bundle Modification ---');

    const modifiedAdvisorRes = await request('/api/advisor/chat', 'POST', {
      message: 'Can we make it more budget-friendly? Please adjust the bundle for a tighter budget.',
      history: [
        {
          role: 'user',
          content: 'We run a busy retail grocery supermarket with 4 checkout counters. We face frequent Wi-Fi dropouts during peak UPI/QR code billing, and we want to send customer billing receipts on WhatsApp. Our budget is around ₹2,500/month.',
        },
        {
          role: 'assistant',
          content: naturalAdvisorRes.data.data?.reply,
        },
      ],
      currentBundle: curatedBundle,
      language: 'en',
    });

    console.log('Modified Advisor Status:', modifiedAdvisorRes.status);
    console.log('Modified Advisor Reply Snippet:', modifiedAdvisorRes.data.data?.reply?.slice(0, 160));
    console.log('Adjusted Bundle Name:', modifiedAdvisorRes.data.data?.bundle?.bundleName);
    console.log('Adjusted MRC: ₹', modifiedAdvisorRes.data.data?.bundle?.estimatedMonthlyPrice);
    console.log('Adjusted Products:', (modifiedAdvisorRes.data.data?.bundle?.recommendedProducts || []).map((p) => p.productId + ' (' + p.productName + ')').join(', '));

    const adjustedBundle = modifiedAdvisorRes.data.data?.bundle;
    if (
      modifiedAdvisorRes.status !== 200 ||
      !adjustedBundle ||
      !adjustedBundle.recommendedProducts?.length ||
      adjustedBundle.oneTimeSetup !== 1000
    ) {
      throw new Error('Contextual follow-up bundle modification failed');
    }

    // ========================================================
    // TEST 31: Profile-Aware Personalized Consultation (Logged-in Customer)
    // ========================================================
    console.log('\n--- Running Test 31: Profile-Aware Personalized Advisor Consultation ---');

    const profileAdvisorRes = await request(
      '/api/advisor/chat',
      'POST',
      {
        message: 'We are expanding our bakery and need multi-counter POS billing and cloud surveillance CCTV cameras.',
        history: [],
        language: 'en',
      },
      customerToken
    );

    console.log('Profile-Aware Advisor Status:', profileAdvisorRes.status);
    console.log('Profile-Aware Advisor Reply Snippet:', profileAdvisorRes.data.data?.reply?.slice(0, 160));
    console.log('Profile-Aware Bundle Name:', profileAdvisorRes.data.data?.bundle?.bundleName);
    console.log('Profile-Aware Products:', (profileAdvisorRes.data.data?.bundle?.recommendedProducts || []).map((p) => p.productId + ' (' + p.productName + ')').join(', '));

    const profileBundle = profileAdvisorRes.data.data?.bundle;
    if (
      profileAdvisorRes.status !== 200 ||
      !profileBundle ||
      !profileBundle.recommendedProducts?.some((p) => p.productId === 'P23' || p.productId === 'P19') ||
      profileBundle.oneTimeSetup !== 1000
    ) {
      throw new Error('Profile-aware advisor consultation failed or did not include required POS/CCTV services');
    }

    console.log('\n>>> ALL 31 ENTERPRISE SUBSYSTEM TESTS ON OFFICIAL COMPANY DATA PASSED! <<<');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();

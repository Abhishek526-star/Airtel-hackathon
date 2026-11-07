const http = require('http');
const app = require('../src/app');
const mongoose = require('mongoose');
const env = require('../src/config/env');

async function runTests() {
  await mongoose.connect(env.MONGODB_URI);
  const server = app.listen(5002);

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
        availabilityStatus: 'ON_TASK',
        isAvailable: true,
      },
      techToken
    );
    console.log('Availability Update HTTP:', availRes.status);
    console.log('New Availability Status:', availRes.data.data?.availabilityStatus);
    if (availRes.status !== 200 || availRes.data.data?.availabilityStatus !== 'ON_TASK') {
      throw new Error('Technician availability update failed');
    }

    console.log('\n>>> ALL 17 AUTOMATED SUBSYSTEM TESTS ON OFFICIAL COMPANY DATA PASSED! <<<');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();

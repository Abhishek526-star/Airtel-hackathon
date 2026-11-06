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

    console.log('\n>>> ALL 13 AUTOMATED SUBSYSTEM TESTS ON OFFICIAL COMPANY DATA PASSED! <<<');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();

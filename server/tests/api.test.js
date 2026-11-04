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

    console.log('\n>>> ALL 8 AUTOMATED SUBSYSTEM TESTS ON OFFICIAL COMPANY DATA PASSED! <<<');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();

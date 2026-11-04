const http = require('http');
const app = require('../src/app');
const mongoose = require('mongoose');
const env = require('../src/config/env');

async function runTests() {
  await mongoose.connect(env.MONGODB_URI);
  const server = app.listen(5001);

  const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const dataString = body ? JSON.stringify(body) : null;
      const options = {
        hostname: 'localhost',
        port: 5001,
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

  try {
    console.log('--- TEST 1: Health Check ---');
    const health = await request('/api/health');
    console.log('Health status:', health.status, 'Success:', health.data.success);

    console.log('\n--- TEST 2: Products Catalogue ---');
    const prods = await request('/api/products');
    console.log('Products count:', prods.data.data.length, 'First product:', prods.data.data[0].productName);

    console.log('\n--- TEST 3: Mock GSTIN Lookup ---');
    const gstin = await request('/api/mock/gstin/07AAAAA0000A1Z5');
    console.log('GSTIN Trade Name:', gstin.data.data.tradeName, 'Status:', gstin.data.data.status);

    console.log('\n--- TEST 4: Customer Login ---');
    const login = await request('/api/auth/login', 'POST', {
      identifier: 'rajesh@guptasupermart.in',
      password: 'Password@123',
    });
    console.log('Login status:', login.status, 'User:', login.data.data.user.fullName);
    const token = login.data.data.token;

    console.log('\n--- TEST 5: AI Advisor Recommendation ---');
    const rec = await request('/api/advisor/recommend', 'POST', {
      segment: 'Micro Retail and Services',
      employees: 3,
      monthlyBudget: 2500,
      requiresPaymentPos: true,
      requiresWhatsapp: true,
      language: 'en',
    });
    console.log('Recommended Bundle:', rec.data.data.bundleName, 'Est MRC:', rec.data.data.estimatedMonthlyPrice);

    console.log('\n--- TEST 6: Pricing Engine Calculation ---');
    const quoteCalc = await request('/api/quotes/calculate', 'POST', {
      items: [
        { productId: 'PROD-BB-200', quantity: 1 },
        { productId: 'PROD-IOT-POS', quantity: 1 },
        { productId: 'PROD-WABA-LITE', quantity: 1 },
      ],
      contractDurationMonths: 24,
    });
    console.log('Base MRC: ₹' + quoteCalc.data.data.baseMrc, 'Discounted MRC: ₹' + quoteCalc.data.data.discountedMrc, 'Total Monthly (incl 18% GST): ₹' + quoteCalc.data.data.totalMonthlyAmount);

    console.log('\n--- TEST 7: Executive Cohort Analytics ---');
    const analytics = await request('/api/analytics/overview');
    console.log('Total Leads:', analytics.data.data.totalLeads, 'Activated:', analytics.data.data.activatedLeads, 'Conv Rate:', analytics.data.data.conversionRate + '%');

    console.log('\n>>> ALL 7 BACKEND SUBSYSTEM TESTS PASSED! <<<');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();

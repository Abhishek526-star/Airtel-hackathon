const Order = require('../models/Order');
const User = require('../models/User');
const Quote = require('../models/Quote');
const BusinessProfile = require('../models/BusinessProfile');
const invoiceService = require('../services/billing/invoiceService');

// Helper to resolve Order, User, Profile and Quote safely without schema populate errors
const resolveInvoiceContext = async (orderId, authUser) => {
  let order = null;
  let user = authUser;
  let profile = null;
  let quote = null;
  let allActiveOrders = [];

  if (user && user._id) {
    allActiveOrders = await Order.find({ user: user._id, orderStatus: { $ne: 'CANCELLED' } })
      .populate('user')
      .populate('businessProfile')
      .populate('quote')
      .sort({ createdAt: -1 });
  }

  if (orderId) {
    order = await Order.findOne({ orderId })
      .populate('user')
      .populate('businessProfile')
      .populate('quote');

    if (order) {
      if (order.user) user = order.user;
      if (order.businessProfile) profile = order.businessProfile;
      if (order.quote) quote = order.quote;
    }
  } else if (allActiveOrders.length > 0) {
    order = allActiveOrders[0];
    if (order.businessProfile) profile = order.businessProfile;
    if (order.quote) quote = order.quote;
  }

  // Fallback profile if not populated via order
  if (!profile && user?._id) {
    profile = await BusinessProfile.findOne({ user: user._id });
  }

  const defaultProfile = {
    legalName: user?.fullName || 'Gupta Enterprises Pvt Ltd',
    tradeName: 'Gupta Supermart',
    segment: 'Micro Retail and Services',
    gstin: '07AAAAA0000A1Z5',
    udyamNumber: 'UDYAM-UP-28-0012345',
    address: {
      street: 'Shop 14, Main Market, Sector 18',
      city: 'Delhi NCR',
      state: 'Delhi',
      pincode: '110001',
    },
  };

  const finalProfile = profile || defaultProfile;

  // Format customer address string
  let customerAddress = 'Shop 14, Main Market, Delhi NCR - 110001';
  if (order?.installationDetails?.installationAddress) {
    customerAddress = `${order.installationDetails.installationAddress}, ${order.installationDetails.city || 'Delhi NCR'} - ${order.installationDetails.pincode || '110001'}`;
  } else if (finalProfile?.address) {
    if (typeof finalProfile.address === 'string') {
      customerAddress = finalProfile.address;
    } else {
      customerAddress = `${finalProfile.address.street || 'Shop 14, Main Market'}, ${finalProfile.address.city || 'Delhi NCR'}, ${finalProfile.address.state || 'Delhi'} - ${finalProfile.address.pincode || '110001'}`;
    }
  }

  return { order, user, profile: finalProfile, quote, customerAddress, allActiveOrders };
};

// @desc    Download Official B2B Telecom GST Tax Invoice PDF
// @route   GET /api/invoices/download
// @access  Public or Protected
exports.downloadInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.query;
    const { order, user, profile, quote, customerAddress, allActiveOrders } = await resolveInvoiceContext(orderId, req.user);

    const invoiceSeq = order?.orderId ? order.orderId.replace(/[^0-9]/g, '') : '8921';
    const invoiceNumber = `ACCEL/2026/B2B-INV-${invoiceSeq}`;

    let items = [];
    let taxableValue = 1992.00;
    let cgstAmount = 179.28;
    let sgstAmount = 179.28;
    let totalAmount = 2350.56;

    // SCENARIO A: If no specific orderId is passed AND customer has multiple active orders:
    // Generate Consolidated Account Monthly Tax Invoice listing ALL active services matching dashboard
    if (!orderId && allActiveOrders && allActiveOrders.length > 1) {
      let combinedMrc = 0;
      items = [];

      allActiveOrders.forEach((ord) => {
        const qSource = ord.quote;
        if (qSource && qSource.items && qSource.items.length > 0) {
          qSource.items.forEach((i) => {
            let sac = '998412';
            const cat = (i.category || '').toLowerCase();
            if (cat.includes('voice') || cat.includes('sim') || cat.includes('mobile')) sac = '998413';
            else if (cat.includes('cloud') || cat.includes('whatsapp')) sac = '998422';
            else if (cat.includes('security') || cat.includes('iot')) sac = '998419';

            const unitRate = i.unitMonthlyPrice || i.monthlyPrice || 999;
            const qty = i.quantity || 1;
            const lineTotal = unitRate * qty;
            combinedMrc += lineTotal;

            items.push({
              desc: `${i.productName} (${i.speedBandwidth || i.category || 'Monthly Service'})`,
              sac,
              qty,
              rate: unitRate,
              discount: 0,
              taxable: lineTotal,
            });
          });
        }
      });

      taxableValue = combinedMrc;
      const totalGst = parseFloat((taxableValue * 0.18).toFixed(2));
      cgstAmount = parseFloat((totalGst / 2).toFixed(2));
      sgstAmount = parseFloat((totalGst / 2).toFixed(2));
      totalAmount = parseFloat((taxableValue + totalGst).toFixed(2));
    } else {
      // SCENARIO B: Specific orderId passed OR single order: itemize ONLY this order's items
      const quoteSource = quote || order?.quoteSnapshot;

      if (quoteSource && quoteSource.items && quoteSource.items.length > 0) {
        const discountTotal = (quoteSource.baseMrc && quoteSource.discountedMrc)
          ? Math.max(0, quoteSource.baseMrc - quoteSource.discountedMrc)
          : (quoteSource.discountAmount || 0);

        const discountPerItem = discountTotal / quoteSource.items.length;

        items = quoteSource.items.map((i) => {
          let sac = '998412';
          const cat = (i.category || '').toLowerCase();
          if (cat.includes('voice') || cat.includes('sim') || cat.includes('mobile')) sac = '998413';
          else if (cat.includes('cloud') || cat.includes('whatsapp')) sac = '998422';
          else if (cat.includes('security') || cat.includes('iot')) sac = '998419';

          const unitRate = i.unitMonthlyPrice || i.monthlyPrice || 999;
          const qty = i.quantity || 1;
          const lineTotal = unitRate * qty;
          const discount = Math.min(lineTotal, discountPerItem);

          return {
            desc: `${i.productName} (${i.speedBandwidth || i.category || 'Monthly Service'})`,
            sac,
            qty,
            rate: unitRate,
            discount,
            taxable: Math.max(0, lineTotal - discount),
          };
        });

        // Reconcile One-Time Installation / Setup Fee (Flat ₹1,000 for initial physical connection; ₹0 for incremental)
        if (quoteSource.totalSetupFee && quoteSource.totalSetupFee > 0) {
          items.push({
            desc: 'One-Time Optical Fiber Installation, ONT Router Provisioning & On-Site Setup',
            sac: '998419',
            qty: 1,
            rate: quoteSource.totalSetupFee,
            discount: 0,
            taxable: quoteSource.totalSetupFee,
          });
        }

        const monthlyTaxable = quoteSource.discountedMrc || quoteSource.baseMrc || 0;
        const setupTaxable = quoteSource.totalSetupFee || 0;
        taxableValue = monthlyTaxable + setupTaxable;

        const monthlyGst = quoteSource.gstMrc || (monthlyTaxable * 0.18);
        const setupGst = quoteSource.gstSetup || (setupTaxable * 0.18);
        const totalGst = monthlyGst + setupGst;

        cgstAmount = parseFloat((totalGst / 2).toFixed(2));
        sgstAmount = parseFloat((totalGst / 2).toFixed(2));

        totalAmount = order?.paymentDetails?.paidAmount || quoteSource.totalOneTimePayable || (taxableValue + totalGst);
      } else {
        // Fallback: Default standard MSME package matching active services in dashboard + flat ₹1,000 setup fee
        items = [
          {
            desc: 'Biz Fibre 300 - Enterprise Broadband (300 Mbps Symmetrical Data)',
            sac: '998412',
            qty: 1,
            rate: 1999.00,
            discount: 0.00,
            taxable: 1999.00,
          },
          {
            desc: 'POS Digital Gateway M2M Corporate SIM (Unlimited CUG Calling)',
            sac: '998413',
            qty: 2,
            rate: 299.00,
            discount: 0.00,
            taxable: 598.00,
          },
          {
            desc: 'WhatsApp Business API Starter (1,000 automated sessions/mo)',
            sac: '998422',
            qty: 1,
            rate: 153.00,
            discount: 0.00,
            taxable: 153.00,
          },
          {
            desc: 'One-Time Optical Fiber Installation & ONT Router Setup (Enterprise Splicing)',
            sac: '998419',
            qty: 1,
            rate: 1000.00,
            discount: 0.00,
            taxable: 1000.00,
          },
        ];
        taxableValue = 3750.00;
        cgstAmount = 337.50;
        sgstAmount = 337.50;
        totalAmount = 4425.00;
      }
    }

    const invoiceData = {
      invoiceNumber,
      invoiceDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      billingPeriod: '01 Nov 2026 to 30 Nov 2026',
      placeOfSupply: `${profile?.address?.state || 'Delhi NCR'} (${(profile?.address?.state || '').includes('Uttar Pradesh') ? '09' : '07'})`,
      reverseCharge: 'No',
      supplier: {
        legalName: 'Accel Telecom Limited (B2B Division)',
        brand: 'Accel Business | Airtel SYNC 2026',
        address: 'Airtel SYNC Technology Park, Plot 16, Udyog Vihar, Sector 18, Gurgaon - 122015',
        gstin: '07AAACA0123M1Z2',
        stateCode: '07 - Delhi Circle',
        email: 'enterprise-billing@accel.com',
      },
      customer: {
        legalName: profile?.legalName || order?.installationDetails?.contactPerson || user?.fullName || 'Gupta Enterprises Pvt Ltd',
        tradeName: profile?.tradeName || profile?.legalName || 'Gupta Supermart',
        address: customerAddress,
        gstin: profile?.gstin || (profile?.hasGstin ? profile.gstin : null) || '07AAAAA0000A1Z5',
        udyamNumber: profile?.udyamNumber || (profile?.hasUdyam ? profile.udyamNumber : null) || 'UDYAM-UP-28-0012345',
        stateCode: (customerAddress.includes('UP') || customerAddress.includes('Uttar Pradesh')) ? '09 - UP' : '07 - Delhi',
        circuitId: order?.serviceActivation?.circuitId || 'ACCEL-NCR-9912',
        staticIp: order?.serviceActivation?.assignedStaticIp || '103.24.188.42',
      },
      items,
      taxableValue,
      cgstRate: 9,
      cgstAmount,
      sgstRate: 9,
      sgstAmount,
      totalAmount,
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceNumber.replace(/\//g, '-')}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const pdfDoc = invoiceService.generateInvoicePdf(invoiceData);
    pdfDoc.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Invoice Details as JSON
// @route   GET /api/invoices/details
// @access  Public or Protected
exports.getInvoiceDetails = async (req, res, next) => {
  try {
    const { orderId } = req.query;
    const { order, profile, quote } = await resolveInvoiceContext(orderId, req.user);
    const quoteSource = quote || order?.quoteSnapshot;

    let items = [];
    const monthlyTaxable = quoteSource?.discountedMrc || quoteSource?.baseMrc || 1992.00;
    const setupTaxable = quoteSource?.totalSetupFee || 0;
    const netTaxableValue = monthlyTaxable + setupTaxable;

    const monthlyGst = quoteSource?.gstMrc || (monthlyTaxable * 0.18);
    const setupGst = quoteSource?.gstSetup || (setupTaxable * 0.18);
    const totalGst = monthlyGst + setupGst;

    const totalAmountPaid = order?.paymentDetails?.paidAmount || quoteSource?.totalOneTimePayable || (netTaxableValue + totalGst);
    const monthlyRecurringAmount = quoteSource?.totalMonthlyAmount || (monthlyTaxable + monthlyGst);

    if (quoteSource && quoteSource.items) {
      items = quoteSource.items.map((i) => ({
        desc: `${i.productName} (${i.speedBandwidth || i.category || 'Monthly Service'})`,
        sac: (i.category || '').toLowerCase().includes('voice') ? '998413' : '998412',
        qty: i.quantity || 1,
        rate: i.unitMonthlyPrice || 999,
        taxable: (i.unitMonthlyPrice || 999) * (i.quantity || 1),
      }));

      if (setupTaxable > 0) {
        items.push({
          desc: 'One-Time Optical Fiber Installation, ONT Router Provisioning & On-Site Setup',
          sac: '998419',
          qty: 1,
          rate: setupTaxable,
          taxable: setupTaxable,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        invoiceNumber: `ACCEL/2026/B2B-INV-${order?.orderId ? order.orderId.replace(/[^0-9]/g, '') : '8921'}`,
        billingPeriod: '01 Nov 2026 – 30 Nov 2026',
        items,
        netTaxableValue,
        cgst: parseFloat((totalGst / 2).toFixed(2)),
        sgst: parseFloat((totalGst / 2).toFixed(2)),
        totalGst: parseFloat(totalGst.toFixed(2)),
        totalAmountPaid,
        monthlyRecurringAmount,
        circuitId: order?.serviceActivation?.circuitId || 'ACCEL-NCR-9912',
        customer: {
          tradeName: profile.tradeName,
          legalName: profile.legalName,
          gstin: profile.gstin,
          udyamNumber: profile.udyamNumber,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


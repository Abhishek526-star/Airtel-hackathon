const Order = require('../models/Order');
const User = require('../models/User');
const Quote = require('../models/Quote');
const BusinessProfile = require('../models/BusinessProfile');
const Invoice = require('../models/Invoice');
const PaymentTransaction = require('../models/PaymentTransaction');
const invoiceService = require('../services/billing/invoiceService');

// Helper to backfill immutable invoices for orders created before Invoice model was introduced
const backfillInvoicesForUser = async (userId) => {
  try {
    const orders = await Order.find({ user: userId })
      .populate('quote')
      .populate('businessProfile')
      .sort({ createdAt: 1 });

    for (const ord of orders) {
      const existingInv = await Invoice.findOne({ order: ord._id });
      if (!existingInv && ord.quote) {
        const quote = ord.quote;
        const invoiceSeq = ord.orderId.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `ACCEL/2026/B2B-INV-${invoiceSeq}`;

        const invoiceItems = (quote.items || []).map((item) => {
          let sac = '998412';
          const cat = (item.category || '').toLowerCase();
          if (cat.includes('voice') || cat.includes('sim') || cat.includes('mobile')) sac = '998413';
          else if (cat.includes('cloud') || cat.includes('whatsapp')) sac = '998422';
          else if (cat.includes('security') || cat.includes('iot')) sac = '998419';

          const unitRate = item.unitMonthlyPrice || item.monthlyPrice || 999;
          const qty = item.quantity || 1;
          return {
            productId: item.productId,
            productName: item.productName,
            description: `${item.productName} (${item.speedBandwidth || item.category || 'Monthly Recurring Service'})`,
            sac,
            quantity: qty,
            rate: unitRate,
            discount: 0,
            taxable: unitRate * qty,
          };
        });

        if (quote.totalSetupFee && quote.totalSetupFee > 0) {
          invoiceItems.push({
            productId: 'SETUP-01',
            productName: 'One-Time Optical Fiber Installation & ONT Setup',
            description: 'Physical fiber drop cable, optical termination box, ONT router configuration, and technician labor',
            sac: '998419',
            quantity: 1,
            rate: quote.totalSetupFee,
            discount: 0,
            taxable: quote.totalSetupFee,
          });
        }

        const taxableAmount = (quote.discountedMrc || quote.baseMrc || 0) + (quote.totalSetupFee || 0);
        const totalGst = (quote.gstMrc || 0) + (quote.gstSetup || 0);
        const totalAmount = ord.paymentDetails?.paidAmount || quote.totalOneTimePayable || (taxableAmount + totalGst);

        const newInv = await Invoice.create({
          invoiceNumber,
          order: ord._id,
          orderId: ord.orderId,
          user: userId,
          businessProfile: ord.businessProfile?._id,
          customerDetails: {
            name: ord.installationDetails?.contactPerson || 'Rajesh Gupta',
            tradeName: ord.businessProfile?.tradeName || 'Gupta Supermart',
            legalName: ord.businessProfile?.legalName || 'Gupta Enterprises Pvt Ltd',
            gstin: ord.businessProfile?.gstin || '07AAAAA0000A1Z5',
            phone: ord.installationDetails?.contactPhone || '9810123456',
            address: ord.installationDetails?.installationAddress || 'Shop 14, Main Market, Sector 18',
            city: ord.installationDetails?.city || 'Delhi NCR',
            state: ord.businessProfile?.address?.state || 'Delhi',
            pincode: ord.installationDetails?.pincode || '110001',
          },
          issueDate: ord.createdAt,
          paymentStatus: ord.orderStatus === 'CANCELLED' ? 'REFUNDED' : 'PAID',
          paymentReference: ord.paymentDetails?.transactionRef || 'TXN-SIM-' + Math.floor(100000 + Math.random() * 900000),
          paymentMode: ord.paymentDetails?.mode || 'Corporate Net Banking / Mandate (ECS)',
          paidAt: ord.paymentDetails?.paidAt || ord.createdAt,
          taxableAmount,
          cgstAmount: parseFloat((totalGst / 2).toFixed(2)),
          sgstAmount: parseFloat((totalGst / 2).toFixed(2)),
          totalAmount,
          items: invoiceItems,
          isIncremental: quote.isIncremental || false,
          pdfDownloadUrl: `/api/invoices/download?orderId=${ord.orderId}`,
        });

        // Also create payment transaction
        await PaymentTransaction.create({
          transactionId: newInv.paymentReference,
          order: ord._id,
          orderId: ord.orderId,
          invoice: newInv._id,
          invoiceNumber: newInv.invoiceNumber,
          user: userId,
          amount: totalAmount,
          currency: 'INR',
          status: ord.orderStatus === 'CANCELLED' ? 'REFUNDED' : 'SUCCESS',
          mode: ord.paymentDetails?.mode || 'Corporate Net Banking / Mandate (ECS)',
          gateway: 'Airtel Payments Bank / B2B Corporate Gateway',
          gatewayRef: 'APBGW-' + Math.floor(10000000 + Math.random() * 90000000),
          timestamp: ord.createdAt,
        });
      }
    }
  } catch (err) {
    console.warn('[Backfill Invoices Warning]', err.message);
  }
};

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

// @desc    Get all Bills and Invoices for current customer with search, filtering and sorting
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await backfillInvoicesForUser(userId);

    const { search = '', status = 'ALL', sortBy = 'issueDate', sortOrder = 'desc' } = req.query;

    const query = { user: userId };

    if (status && status !== 'ALL') {
      query.paymentStatus = status.toUpperCase();
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { invoiceNumber: new RegExp(s, 'i') },
        { orderId: new RegExp(s, 'i') },
        { 'items.productName': new RegExp(s, 'i') },
        { paymentReference: new RegExp(s, 'i') },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const invoices = await Invoice.find(query).sort(sortOptions);

    // Compute summary analytics
    const allUserInvoices = await Invoice.find({ user: userId });
    const totalInvoiced = allUserInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = allUserInvoices
      .filter((inv) => inv.paymentStatus === 'PAID')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const paidCount = allUserInvoices.filter((inv) => inv.paymentStatus === 'PAID').length;
    const pendingCount = allUserInvoices.filter((inv) => inv.paymentStatus === 'PENDING').length;

    res.status(200).json({
      success: true,
      data: {
        invoices,
        summary: {
          totalInvoicesCount: allUserInvoices.length,
          totalInvoiced,
          totalPaid,
          paidCount,
          pendingCount,
          activeMandates: allUserInvoices.length > 0 ? 1 : 0,
        },
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Invoice Details by ID or Invoice Number
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let invoice = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      invoice = await Invoice.findById(id).populate('order');
    }

    if (!invoice) {
      invoice = await Invoice.findOne({
        $or: [{ invoiceNumber: id }, { orderId: id }],
      }).populate('order');
    }

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: `Invoice '${id}' not found.`,
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Payment Transaction History
// @route   GET /api/invoices/transactions/history
// @access  Private
exports.getPaymentTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await backfillInvoicesForUser(userId);

    const transactions = await PaymentTransaction.find({ user: userId }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Official B2B Telecom GST Tax Invoice PDF
// @route   GET /api/invoices/download
// @access  Public or Protected
exports.downloadInvoice = async (req, res, next) => {
  try {
    const orderId = req.query.orderId || req.params.orderId;
    const { order, user, profile, quote, customerAddress, allActiveOrders } = await resolveInvoiceContext(orderId, req.user);

    const invoiceSeq = order?.orderId ? order.orderId.replace(/[^0-9]/g, '') : '8921';
    const invoiceNumber = `ACCEL/2026/B2B-INV-${invoiceSeq}`;

    let items = [];
    let taxableValue = 1992.00;
    let cgstAmount = 179.28;
    let sgstAmount = 179.28;
    let totalAmount = 2350.56;

    // Check if a saved immutable invoice exists in DB
    const savedInvoice = order ? await Invoice.findOne({ order: order._id }) : null;
    if (savedInvoice && savedInvoice.items && savedInvoice.items.length > 0) {
      items = savedInvoice.items.map((i) => ({
        desc: i.description || i.productName,
        sac: i.sac || '998412',
        qty: i.quantity || 1,
        rate: i.rate,
        discount: i.discount || 0,
        taxable: i.taxable,
      }));
      taxableValue = savedInvoice.taxableAmount;
      cgstAmount = savedInvoice.cgstAmount;
      sgstAmount = savedInvoice.sgstAmount;
      totalAmount = savedInvoice.totalAmount;
    } else if (!orderId && allActiveOrders && allActiveOrders.length > 1) {
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
            desc: 'One-Time Optical Fiber Installation, ONT Router Provisioning & On-Site Setup',
            sac: '998419',
            qty: 1,
            rate: 1000.00,
            discount: 0.00,
            taxable: 1000.00,
          },
        ];
        taxableValue = 2999.00;
        const totalGst = parseFloat((taxableValue * 0.18).toFixed(2));
        cgstAmount = parseFloat((totalGst / 2).toFixed(2));
        sgstAmount = parseFloat((totalGst / 2).toFixed(2));
        totalAmount = parseFloat((taxableValue + totalGst).toFixed(2));
      }
    }

    const invoiceData = {
      invoiceNumber: savedInvoice?.invoiceNumber || invoiceNumber,
      invoiceDate: (savedInvoice?.issueDate || order?.createdAt || new Date()).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      billingPeriod: '01 Nov 2026 – 30 Nov 2026',
      placeOfSupply: '07-DELHI (State Code 07)',
      reverseCharge: 'No',
      orderId: order?.orderId || (orderId || 'ACCEL-ORD-2026-8921'),
      circuitId: order?.serviceActivation?.circuitId || 'ACCEL-DEL-FIBRE-8921',
      customer: {
        legalName: savedInvoice?.customerDetails?.legalName || profile.legalName || 'Gupta Enterprises Pvt Ltd',
        tradeName: savedInvoice?.customerDetails?.tradeName || profile.tradeName || 'Gupta Supermart',
        address: customerAddress,
        gstin: savedInvoice?.customerDetails?.gstin || profile.gstin || '07AAAAA0000A1Z5',
        stateCode: '07 (Delhi)',
        udyamNumber: profile.udyamNumber || 'UDYAM-UP-28-0012345',
      },
      items,
      totals: {
        taxableValue,
        cgstRate: 9,
        cgstAmount,
        sgstRate: 9,
        sgstAmount,
        igstRate: 0,
        igstAmount: 0.00,
        totalGst: cgstAmount + sgstAmount,
        totalAmount,
        amountInWords: invoiceService.numberToWords(Math.round(totalAmount)),
      },
      payment: {
        mode: savedInvoice?.paymentMode || order?.paymentDetails?.mode || 'Corporate Net Banking / Mandate (ECS)',
        status: savedInvoice?.paymentStatus || order?.paymentStatus || 'PAID',
        transactionRef: savedInvoice?.paymentReference || order?.paymentDetails?.transactionRef || 'TXN-SIM-892110',
        paidAt: (savedInvoice?.paidAt || order?.paymentDetails?.paidAt || new Date()).toLocaleString('en-IN'),
      },
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${invoiceData.invoiceNumber.replace(/\//g, '_')}.pdf"`
    );
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

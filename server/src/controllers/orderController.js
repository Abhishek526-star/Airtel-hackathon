const Order = require('../models/Order');
const Quote = require('../models/Quote');
const BusinessProfile = require('../models/BusinessProfile');
const KYCDocument = require('../models/KYCDocument');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const PaymentTransaction = require('../models/PaymentTransaction');
const { emitOrderCreated, emitOrderStatusUpdated, emitTechnicianTaskUpdated } = require('../socket');

const generateOrderId = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ACCEL-ORD-${randomNum}`;
};

// @desc    Create order from accepted quote (Checkout)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      quoteId,
      installationAddress,
      city,
      pincode,
      contactPerson,
      contactPhone,
      scheduledDate,
      timeSlot,
    } = req.body;

    if (!quoteId) {
      return res.status(400).json({
        success: false,
        message: 'quoteId is required to create an order.',
        data: null,
        error: { code: 'MISSING_QUOTE_ID' },
      });
    }

    const quote = await Quote.findOne({
      $or: [{ quoteId }, { _id: (typeof quoteId === 'string' && quoteId.match(/^[0-9a-fA-F]{24}$/)) ? quoteId : null }],
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Associated quote not found.',
        data: null,
        error: { code: 'QUOTE_NOT_FOUND' },
      });
    }

    const profile = await BusinessProfile.findOne({ user: req.user._id });

    // Idempotency: prevent accidental duplicate order if clicked multiple times within 10 seconds
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const existingRecentOrder = await Order.findOne({
      user: req.user._id,
      quote: quote._id,
      createdAt: { $gte: tenSecondsAgo },
    });
    if (existingRecentOrder) {
      return res.status(200).json({
        success: true,
        message: 'Order already received and confirmed.',
        data: existingRecentOrder,
        error: null,
      });
    }

    // Check if user has verified KYC documents OR verified business profile (Reusable KYC)
    const verifiedKyc = await KYCDocument.findOne({
      user: req.user._id,
      verificationStatus: 'VERIFIED',
    });

    const isKycAlreadyVerified = Boolean(
      verifiedKyc ||
      (profile && profile.kycStatus === 'VERIFIED') ||
      profile?.hasGstin ||
      profile?.hasUdyam
    );

    const initialKycStatus = isKycAlreadyVerified ? 'VERIFIED' : 'DOCUMENTS_PENDING';
    const initialOrderStatus = isKycAlreadyVerified ? 'KYC_VERIFIED' : 'KYC_PENDING';

    const orderId = generateOrderId();
    const scheduledDateTime = scheduledDate ? new Date(scheduledDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const timeline = [
      {
        status: 'ORDER_PLACED',
        title: 'Order Placed Successfully',
        description: `Order ${orderId} submitted. Total one-time payable: ₹${quote.totalOneTimePayable.toLocaleString('en-IN')}.`,
        timestamp: new Date(),
      },
    ];

    if (isKycAlreadyVerified) {
      timeline.push({
        status: 'KYC_VERIFIED',
        title: 'Smart KYC Pre-Verified (Rule 46 DoT)',
        description: `DoT verified credential reused under registration ${profile?.gstin || profile?.udyamNumber || verifiedKyc?.ocrExtractedData?.extractedId || 'Registry Verified'}. Zero paperwork required.`,
        timestamp: new Date(),
      });
    }

    const targetCity = city || (profile && profile.address ? profile.address.city : 'Delhi NCR');

    // Dynamic field technician routing based on operational circle & load balancing
    let assignedTech = null;
    try {
      // 1. Prioritize available technician in matching circle
      assignedTech = await User.findOne({
        role: 'technician',
        availabilityStatus: 'AVAILABLE',
        territoryCircle: new RegExp(targetCity, 'i'),
      }).sort({ activeAssignedInstallationsCount: 1 });

      // 2. If none strictly AVAILABLE, assign any non-OFFLINE technician in the circle
      if (!assignedTech) {
        assignedTech = await User.findOne({
          role: 'technician',
          availabilityStatus: { $ne: 'OFFLINE' },
          territoryCircle: new RegExp(targetCity, 'i'),
        }).sort({ activeAssignedInstallationsCount: 1 });
      }

      // 3. If all in circle are busy/offline, assign the lowest-loaded technician in the circle
      if (!assignedTech) {
        assignedTech = await User.findOne({
          role: 'technician',
          territoryCircle: new RegExp(targetCity, 'i'),
        }).sort({ activeAssignedInstallationsCount: 1 });
      }

      // 4. Fallback to lowest loaded active technician in fleet
      if (!assignedTech) {
        assignedTech = await User.findOne({
          role: 'technician',
          isAvailable: true,
        }).sort({ activeAssignedInstallationsCount: 1 });
      }

      // 5. Ultimate fallback to any technician
      if (!assignedTech) {
        assignedTech = await User.findOne({ role: 'technician' });
      }

      if (assignedTech) {
        assignedTech.activeAssignedInstallationsCount = (assignedTech.activeAssignedInstallationsCount || 0) + 1;
        await assignedTech.save();
      }
    } catch (techErr) {
      console.warn('[Technician Assignment Error]', techErr.message);
    }

    const techName = assignedTech ? assignedTech.fullName : 'Ramesh Kumar';
    const techPhone = assignedTech ? assignedTech.phone : '+91 98110 54321';
    const techBadge = assignedTech ? assignedTech.badgeId : 'ENG-DELHI-408';

    const order = await Order.create({
      orderId,
      user: req.user._id,
      businessProfile: profile ? profile._id : null,
      quote: quote._id,
      assignedTechnician: assignedTech ? assignedTech._id : null,
      orderStatus: initialOrderStatus,
      kycStatus: initialKycStatus,
      paymentStatus: 'SIMULATED_PAID',
      paymentDetails: {
        paidAmount: quote.totalOneTimePayable,
        mode: 'Corporate Net Banking / Mandate (ECS)',
      },
      installationDetails: {
        installationAddress: installationAddress || (profile && profile.address ? profile.address.street : 'Main Market Road'),
        city: targetCity,
        pincode: pincode || (profile && profile.address ? profile.address.pincode : '110001'),
        contactPerson: contactPerson || req.user.fullName,
        contactPhone: contactPhone || req.user.phone,
        scheduledDate: scheduledDateTime,
        timeSlot: timeSlot || '10:00 AM - 01:00 PM',
        assignedEngineer: {
          name: techName,
          phone: techPhone,
          badgeId: techBadge,
        },
      },
      timeline,
    });

    // Mark quote as accepted
    quote.status = 'ACCEPTED';
    await quote.save();

    // Generate Immutable B2B GST Tax Invoice for this specific Order
    try {
      const invoiceSeq = orderId.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000);
      const invoiceNumber = `ACCEL/2026/B2B-INV-${invoiceSeq}`;

      const invoiceItems = (quote.items || []).map((item) => {
        let sac = '998412';
        const cat = (item.category || '').toLowerCase();
        if (cat.includes('voice') || cat.includes('sim') || cat.includes('mobile')) sac = '998413';
        else if (cat.includes('cloud') || cat.includes('whatsapp')) sac = '998422';
        else if (cat.includes('security') || cat.includes('iot')) sac = '998419';

        const unitRate = item.unitMonthlyPrice || item.monthlyPrice || 999;
        const qty = item.quantity || 1;
        const lineTotal = unitRate * qty;
        return {
          productId: item.productId,
          productName: item.productName,
          description: `${item.productName} (${item.speedBandwidth || item.category || 'Monthly Recurring Service'})`,
          sac,
          quantity: qty,
          rate: unitRate,
          discount: 0,
          taxable: lineTotal,
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
      const cgstAmount = parseFloat((totalGst / 2).toFixed(2));
      const sgstAmount = parseFloat((totalGst / 2).toFixed(2));
      const totalAmount = quote.totalOneTimePayable || (taxableAmount + totalGst);

      const invoice = await Invoice.create({
        invoiceNumber,
        order: order._id,
        orderId: order.orderId,
        user: req.user._id,
        businessProfile: profile ? profile._id : null,
        customerDetails: {
          name: req.user.fullName,
          tradeName: profile?.tradeName || 'Gupta Supermart',
          legalName: profile?.legalName || req.user.fullName,
          gstin: profile?.gstin || '07AAAAA0000A1Z5',
          phone: req.user.phone,
          address: installationAddress || (profile?.address?.street || 'Shop 14, Main Market'),
          city: targetCity,
          state: profile?.address?.state || 'Delhi',
          pincode: pincode || '110001',
        },
        issueDate: new Date(),
        paymentStatus: 'PAID',
        paymentReference: order.paymentDetails?.transactionRef || 'TXN-SIM-' + Math.floor(100000 + Math.random() * 900000),
        paymentMode: 'Corporate AutoPay Mandate (e-NACH)',
        paidAt: new Date(),
        taxableAmount,
        cgstAmount,
        sgstAmount,
        totalAmount,
        items: invoiceItems,
        isIncremental: quote.isIncremental || false,
        pdfDownloadUrl: `/api/invoices/download?orderId=${order.orderId}`,
      });

      await PaymentTransaction.create({
        transactionId: invoice.paymentReference,
        order: order._id,
        orderId: order.orderId,
        invoice: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        user: req.user._id,
        amount: totalAmount,
        currency: 'INR',
        status: 'SUCCESS',
        mode: 'Corporate AutoPay Mandate (e-NACH)',
        gateway: 'Airtel Payments Bank / B2B Corporate Gateway',
        gatewayRef: 'APBGW-' + Math.floor(10000000 + Math.random() * 90000000),
        timestamp: new Date(),
      });
    } catch (invErr) {
      console.warn('[Invoice Generation Warning]', invErr.message);
    }

    // Real-Time Notification to Admin, User, and assigned Field Technician
    emitOrderCreated(order);

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Installation slot confirmed.',
      data: order,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for the current user
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('quote')
      .populate('businessProfile')
      .populate('assignedTechnician', 'fullName phone badgeId specialization territoryCircle')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: `Retrieved ${orders.length} orders.`,
      data: orders,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by orderId
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      $or: [{ orderId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    })
      .populate('quote')
      .populate('businessProfile')
      .populate('assignedTechnician', 'fullName phone badgeId specialization territoryCircle');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order '${req.params.id}' not found.`,
        data: null,
        error: { code: 'ORDER_NOT_FOUND' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order retrieved.',
      data: order,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order lifecycle status (advance state machine)
// @route   PATCH /api/orders/:id/status
// @access  Private (Partner / Admin / Demo customer self-advance)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { nextStatus, notes } = req.body;
    const order = await Order.findOne({
      $or: [{ orderId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order '${req.params.id}' not found.`,
        data: null,
        error: { code: 'ORDER_NOT_FOUND' },
      });
    }

    // Allowed status transitions
    const validTransitions = {
      ORDER_PLACED: ['KYC_PENDING', 'KYC_VERIFIED'],
      KYC_PENDING: ['KYC_VERIFIED', 'NEEDS_REVIEW', 'REJECTED'],
      KYC_VERIFIED: ['INSTALLATION_SCHEDULED'],
      INSTALLATION_SCHEDULED: ['INSTALLATION_IN_PROGRESS'],
      INSTALLATION_IN_PROGRESS: ['ACTIVATED'],
      ACTIVATED: [],
    };

    order.orderStatus = nextStatus;

    // Timeline descriptions
    const statusTitles = {
      KYC_VERIFIED: 'Smart KYC Verification Succeeded',
      INSTALLATION_SCHEDULED: 'Enterprise Field Engineer Assigned',
      INSTALLATION_IN_PROGRESS: 'Field Technician On-Site Installing CPE Router',
      ACTIVATED: 'Service Successfully Provisioned & Live',
    };

    if (nextStatus === 'ACTIVATED') {
      order.serviceActivation = {
        activatedAt: new Date(),
        circuitId: 'ACCEL-FIBER-NCR-' + Math.floor(10000 + Math.random() * 90000),
        cpeSerialNumber: 'ONT-NOKIA-XS-' + Math.floor(100000 + Math.random() * 900000),
        assignedStaticIp: '103.24.188.' + Math.floor(20 + Math.random() * 200),
        slaUptimePercent: 99.8,
      };
    }

    order.timeline.push({
      status: nextStatus,
      title: statusTitles[nextStatus] || `Status updated to ${nextStatus}`,
      description: notes || `Order progressed to ${nextStatus}.`,
      timestamp: new Date(),
    });

    await order.save();

    // Real-Time Notification to Customer, Field Tech, and Admin
    emitOrderStatusUpdated(order, { notes });
    emitTechnicianTaskUpdated(order, { notes });

    res.status(200).json({
      success: true,
      message: `Order transitioned to ${nextStatus}.`,
      data: order,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};


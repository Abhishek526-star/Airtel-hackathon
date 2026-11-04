const Order = require('../models/Order');
const Quote = require('../models/Quote');
const BusinessProfile = require('../models/BusinessProfile');
const KYCDocument = require('../models/KYCDocument');

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

    const quote = await Quote.findOne({
      $or: [{ quoteId }, { _id: quoteId.match(/^[0-9a-fA-F]{24}$/) ? quoteId : null }],
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

    // Check if user has verified KYC documents
    const verifiedKyc = await KYCDocument.findOne({
      user: req.user._id,
      verificationStatus: 'VERIFIED',
    });

    const initialKycStatus = verifiedKyc ? 'VERIFIED' : 'DOCUMENTS_PENDING';
    const initialOrderStatus = verifiedKyc ? 'KYC_VERIFIED' : 'KYC_PENDING';

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

    if (verifiedKyc) {
      timeline.push({
        status: 'KYC_VERIFIED',
        title: 'Smart KYC Pre-Verified',
        description: `Entity verified via ${verifiedKyc.documentType} (${verifiedKyc.ocrExtractedData.extractedId}).`,
        timestamp: new Date(),
      });
    }

    const order = await Order.create({
      orderId,
      user: req.user._id,
      businessProfile: profile ? profile._id : null,
      quote: quote._id,
      orderStatus: initialOrderStatus,
      kycStatus: initialKycStatus,
      paymentStatus: 'SIMULATED_PAID',
      paymentDetails: {
        paidAmount: quote.totalOneTimePayable,
        mode: 'Simulated UPI / Net Banking',
      },
      installationDetails: {
        installationAddress: installationAddress || (profile && profile.address ? profile.address.street : 'Main Market Road'),
        city: city || (profile && profile.address ? profile.address.city : 'Delhi NCR'),
        pincode: pincode || (profile && profile.address ? profile.address.pincode : '110001'),
        contactPerson: contactPerson || req.user.fullName,
        contactPhone: contactPhone || req.user.phone,
        scheduledDate: scheduledDateTime,
        timeSlot: timeSlot || '10:00 AM - 01:00 PM',
        assignedEngineer: {
          name: 'Ramesh Kumar',
          phone: '+91 98110 54321',
          badgeId: 'ENG-DELHI-408',
        },
      },
      timeline,
    });

    // Mark quote as accepted
    quote.status = 'ACCEPTED';
    await quote.save();

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
      .populate('businessProfile');

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


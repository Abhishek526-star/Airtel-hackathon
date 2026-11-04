const Quote = require('../models/Quote');
const BusinessProfile = require('../models/BusinessProfile');
const pricingService = require('../services/pricing/pricingService');

const generateQuoteId = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ACCEL-Q-${randomNum}`;
};

// @desc    Calculate quote pricing breakdown (preview without saving)
// @route   POST /api/quotes/calculate
// @access  Public / Authenticated
exports.calculateQuote = async (req, res, next) => {
  try {
    const { items = [], contractDurationMonths = 12 } = req.body;
    const calculation = await pricingService.calculateQuote(items, contractDurationMonths);

    res.status(200).json({
      success: true,
      message: 'Pricing calculation completed.',
      data: calculation,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create & lock a persistent quote
// @route   POST /api/quotes
// @access  Private (Authenticated)
exports.createQuote = async (req, res, next) => {
  try {
    const { items = [], contractDurationMonths = 12, bundleName } = req.body;
    const calculation = await pricingService.calculateQuote(items, contractDurationMonths);

    const profile = await BusinessProfile.findOne({ user: req.user._id });

    const quote = await Quote.create({
      quoteId: generateQuoteId(),
      user: req.user._id,
      businessProfile: profile ? profile._id : null,
      bundleName: bundleName || 'Custom MSME Digital Bundle',
      items: calculation.items,
      contractDurationMonths: calculation.contractDurationMonths,
      baseMrc: calculation.baseMrc,
      contractDiscountPercent: calculation.contractDiscountPercent,
      discountedMrc: calculation.discountedMrc,
      totalSetupFee: calculation.totalSetupFee,
      gstRatePercent: calculation.gstRatePercent,
      gstMrc: calculation.gstMrc,
      gstSetup: calculation.gstSetup,
      totalMonthlyAmount: calculation.totalMonthlyAmount,
      totalOneTimePayable: calculation.totalOneTimePayable,
      status: 'DRAFT',
    });

    res.status(201).json({
      success: true,
      message: 'Quote created successfully.',
      data: quote,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quote by quoteId or MongoDB _id
// @route   GET /api/quotes/:id
// @access  Private (Authenticated)
exports.getQuoteById = async (req, res, next) => {
  try {
    const quote = await Quote.findOne({
      $or: [{ quoteId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    }).populate('businessProfile');

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: `Quote '${req.params.id}' not found.`,
        data: null,
        error: { code: 'QUOTE_NOT_FOUND' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quote retrieved.',
      data: quote,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept quote
// @route   POST /api/quotes/:id/accept
// @access  Private (Authenticated)
exports.acceptQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findOne({
      $or: [{ quoteId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: `Quote '${req.params.id}' not found.`,
        data: null,
        error: { code: 'QUOTE_NOT_FOUND' },
      });
    }

    quote.status = 'ACCEPTED';
    await quote.save();

    res.status(200).json({
      success: true,
      message: 'Quote accepted successfully. Ready for Smart KYC and checkout.',
      data: quote,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};


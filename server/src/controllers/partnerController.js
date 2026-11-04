const Lead = require('../models/Lead');
const KYCDocument = require('../models/KYCDocument');
const Order = require('../models/Order');

// @desc    Get leads assigned to partner
// @route   GET /api/partner/leads
// @access  Private (Partner / Admin)
exports.getAssignedLeads = async (req, res, next) => {
  try {
    const { status, segment, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (segment) {
      query.segment = segment;
    }
    if (search) {
      query.businessName = { $regex: search, $options: 'i' };
    }

    const leads = await Lead.find(query).limit(50).sort({ updatedAt: -1 });
    const totalCount = await Lead.countDocuments(query);

    // Summary counts for partner dashboard pills
    const kycIssuesCount = await Lead.countDocuments({ status: 'KYC Dropped' });
    const abandonedQuotesCount = await Lead.countDocuments({ status: 'Quote Abandoned' });
    const activeLeadsCount = await Lead.countDocuments({ status: { $in: ['Quote Generated', 'Lead Ingested'] } });

    res.status(200).json({
      success: true,
      message: 'Assigned leads retrieved.',
      data: {
        totalCount,
        stats: {
          kycIssuesCount,
          abandonedQuotesCount,
          activeLeadsCount,
        },
        leads,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lead details with diagnostic
// @route   GET /api/partner/leads/:id
// @access  Private (Partner / Admin)
exports.getLeadDetails = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({
      $or: [{ leadId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
        data: null,
        error: { code: 'LEAD_NOT_FOUND' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead details retrieved.',
      data: lead,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assisted manual override or verification for KYC exceptions
// @route   POST /api/partner/leads/:id/assist-kyc
// @access  Private (Partner / Admin)
exports.assistKyc = async (req, res, next) => {
  try {
    const { reason = 'Partner verified physical documents on site' } = req.body;
    const lead = await Lead.findOne({
      $or: [{ leadId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });

    if (lead) {
      lead.status = 'Activated';
      lead.dropReason = 'None';
      lead.leadToActivationDays = 1;
      await lead.save();
    }

    res.status(200).json({
      success: true,
      message: 'Partner assisted verification recorded. Lead unblocked.',
      data: lead,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

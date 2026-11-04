const Lead = require('../models/Lead');

// @desc    Get executive overview analytics metrics
// @route   GET /api/analytics/overview
// @access  Public / Admin
exports.getOverview = async (req, res, next) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const activatedLeads = await Lead.countDocuments({ status: 'Activated' });
    const conversionRate = totalLeads > 0 ? ((activatedLeads / totalLeads) * 100).toFixed(2) : '7.36';

    // Baseline legacy metrics vs Digital platform target metrics
    const metrics = {
      totalLeads: totalLeads || 5000,
      activatedLeads: activatedLeads || 368,
      conversionRate: parseFloat(conversionRate),
      legacyAvgActivationDays: 17.6,
      digitalAvgActivationDays: 1.5,
      legacyBlendedCac: 15000,
      digitalTargetCac: 4200,
      avgFollowUpsLegacy: 3.2,
      avgFollowUpsDigital: 0.2,
    };

    res.status(200).json({
      success: true,
      message: 'Executive analytics overview retrieved.',
      data: metrics,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversion funnel breakdown
// @route   GET /api/analytics/funnel
// @access  Public / Admin
exports.getFunnel = async (req, res, next) => {
  try {
    const total = 5000;
    const quoteGenerated = 3250;
    const quoteAccepted = 2100;
    const kycSubmitted = 1180;
    const kycApproved = 480;
    const activated = 368;

    const funnelData = [
      { stage: '1. Ingested Leads', count: total, percentage: 100 },
      { stage: '2. Quotes Generated', count: quoteGenerated, percentage: 65.0 },
      { stage: '3. Quotes Accepted', count: quoteAccepted, percentage: 42.0 },
      { stage: '4. KYC Submitted', count: kycSubmitted, percentage: 23.6 },
      { stage: '5. KYC Verified', count: kycApproved, percentage: 9.6 },
      { stage: '6. Live Activated', count: activated, percentage: 7.36 },
    ];

    res.status(200).json({
      success: true,
      message: 'Conversion funnel data retrieved.',
      data: funnelData,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get segment & GSTIN disparity analytics
// @route   GET /api/analytics/cohort
// @access  Public / Admin
exports.getCohortAnalytics = async (req, res, next) => {
  try {
    // Aggregation for segment distribution
    const segmentAgg = await Lead.aggregate([
      {
        $group: {
          _id: '$segment',
          total: { $sum: 1 },
          activated: {
            $sum: { $cond: [{ $eq: ['$status', 'Activated'] }, 1, 0] },
          },
        },
      },
    ]);

    // Format segments
    const segmentPerformance = segmentAgg.map((s) => ({
      segment: s._id || 'Micro Retail and Services',
      total: s.total,
      activated: s.activated,
      conversionRate: s.total > 0 ? parseFloat(((s.activated / s.total) * 100).toFixed(2)) : 0,
    }));

    // GSTIN Disparity Comparison
    const gstinLeads = await Lead.countDocuments({ hasGstin: true });
    const gstinActivated = await Lead.countDocuments({ hasGstin: true, status: 'Activated' });
    const noGstinLeads = await Lead.countDocuments({ hasGstin: false });
    const noGstinActivated = await Lead.countDocuments({ hasGstin: false, status: 'Activated' });

    const gstinDisparity = [
      {
        cohort: 'Leads WITH Verified GSTIN',
        totalLeads: gstinLeads || 3525,
        activated: gstinActivated || 336,
        conversionRate: gstinLeads > 0 ? parseFloat(((gstinActivated / gstinLeads) * 100).toFixed(2)) : 9.6,
      },
      {
        cohort: 'Leads WITHOUT GSTIN',
        totalLeads: noGstinLeads || 1475,
        activated: noGstinActivated || 32,
        conversionRate: noGstinLeads > 0 ? parseFloat(((noGstinActivated / noGstinLeads) * 100).toFixed(2)) : 2.0,
      },
    ];

    // Drop-off root cause distribution
    const dropOffReasons = [
      { reason: 'Document verification delay / Physical paperwork', count: 1820, percentage: 39.3 },
      { reason: 'Price sensitivity & slow quote turnaround (3-5 days)', count: 1410, percentage: 30.4 },
      { reason: 'Installation technician delay / Feasibility issue', count: 890, percentage: 19.2 },
      { reason: 'Chose competitor or cold lead drop', count: 512, percentage: 11.1 },
    ];

    res.status(200).json({
      success: true,
      message: 'Cohort analytics retrieved.',
      data: {
        segmentPerformance,
        gstinDisparity,
        dropOffReasons,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

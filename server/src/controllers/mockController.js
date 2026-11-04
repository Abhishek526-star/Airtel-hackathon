const mockRegistry = require('../services/registry/mockRegistryService');

// @desc    Mock GSTIN Lookup
// @route   GET /api/mock/gstin/:gstin
// @access  Public
exports.lookupGstin = (req, res) => {
  const { gstin } = req.params;
  const record = mockRegistry.lookupGSTIN(gstin);

  if (!record) {
    return res.status(404).json({
      success: false,
      message: `GSTIN '${gstin}' not found in registry.`,
      data: null,
      error: { code: 'GSTIN_NOT_FOUND' },
    });
  }

  res.status(200).json({
    success: true,
    message: 'GSTIN record found.',
    data: record,
    error: null,
  });
};

// @desc    Mock Udyam Lookup
// @route   GET /api/mock/udyam/:udyam
// @access  Public
exports.lookupUdyam = (req, res) => {
  const { udyam } = req.params;
  const record = mockRegistry.lookupUdyam(udyam);

  if (!record) {
    return res.status(404).json({
      success: false,
      message: `Udyam Number '${udyam}' not found in registry.`,
      data: null,
      error: { code: 'UDYAM_NOT_FOUND' },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Udyam record found.',
    data: record,
    error: null,
  });
};

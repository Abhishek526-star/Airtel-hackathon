const BusinessProfile = require('../models/BusinessProfile');

// @desc    Get current user's business profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    let profile = await BusinessProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await BusinessProfile.create({
        user: req.user._id,
        tradeName: `${req.user.fullName}'s Business`,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Business profile retrieved.',
      data: profile,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update business profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    let profile = await BusinessProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Business profile updated successfully.',
      data: profile,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};


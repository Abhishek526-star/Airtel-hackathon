const User = require('../models/User');
const BusinessProfile = require('../models/BusinessProfile');

// @desc    Get current user's full profile (User + BusinessProfile + KYC state)
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
        data: null,
        error: { code: 'USER_NOT_FOUND' },
      });
    }

    let profile = await BusinessProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await BusinessProfile.create({
        user: req.user._id,
        tradeName: user.agencyName || `${user.fullName}'s Business`,
        legalName: user.agencyName || user.fullName,
        segment: user.role === 'partner' ? 'Telecom Channel Partner' : 'Micro Retail and Services',
      });
      user.businessProfile = profile._id;
      await user.save();
    }

    // Auto-sync KYC status if GSTIN or Udyam is already present
    if ((profile.hasGstin || profile.hasUdyam) && profile.kycStatus !== 'VERIFIED') {
      profile.kycStatus = 'VERIFIED';
      if (!profile.kycVerifiedAt) profile.kycVerifiedAt = new Date();
      if (!profile.kycVerifiedIdentifier) {
        profile.kycVerifiedIdentifier = profile.gstin || profile.udyamNumber || '';
      }
      await profile.save();
    }

    const overallKycStatus = profile.kycStatus || ((profile.hasGstin || profile.hasUdyam) ? 'VERIFIED' : 'NOT_STARTED');

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: {
        ...profile.toObject(),
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          agencyName: user.agencyName || '',
          partnerCode: user.partnerCode || '',
          territoryCircle: user.territoryCircle || 'Delhi NCR',
          isAvailable: user.isAvailable ?? true,
          availabilityStatus: user.availabilityStatus || 'AVAILABLE',
          activeAssignedLeadsCount: user.activeAssignedLeadsCount || 0,
        },
        businessProfile: profile,
        kyc: {
          status: overallKycStatus,
          isCompleted: overallKycStatus === 'VERIFIED',
          verifiedAt: profile.kycVerifiedAt,
          documentType: profile.kycDocumentType || (profile.hasGstin ? 'GST_CERTIFICATE' : (profile.hasUdyam ? 'UDYAM_CERTIFICATE' : '')),
          verifiedIdentifier: profile.kycVerifiedIdentifier || profile.gstin || profile.udyamNumber || '',
        },
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile (User and/or BusinessProfile attributes)
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      agencyName,
      territoryCircle,
      isAvailable,
      availabilityStatus,
      tradeName,
      legalName,
      segment,
      industry,
      employees,
      locations,
      address,
      currentIsp,
      monthlyBudget,
      preferredLanguage,
    } = req.body;

    // 1. Update User attributes if supplied
    const userUpdates = {};
    if (fullName) userUpdates.fullName = fullName.trim();
    if (phone) userUpdates.phone = phone.trim();
    if (agencyName !== undefined) userUpdates.agencyName = agencyName.trim();
    if (territoryCircle !== undefined) userUpdates.territoryCircle = territoryCircle.trim();
    if (isAvailable !== undefined) {
      userUpdates.isAvailable = Boolean(isAvailable);
      userUpdates.availabilityStatus = userUpdates.isAvailable ? 'AVAILABLE' : 'BUSY';
    }
    if (availabilityStatus) {
      userUpdates.availabilityStatus = availabilityStatus;
      userUpdates.isAvailable = availabilityStatus === 'AVAILABLE';
    }

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, { $set: userUpdates }, { runValidators: true });
    }

    // 2. Update BusinessProfile attributes
    const profileUpdates = {};
    if (tradeName !== undefined) profileUpdates.tradeName = tradeName.trim();
    if (legalName !== undefined) profileUpdates.legalName = legalName.trim();
    if (segment !== undefined) profileUpdates.segment = segment;
    if (industry !== undefined) profileUpdates.industry = industry;
    if (employees !== undefined) profileUpdates.employees = Number(employees);
    if (locations !== undefined) profileUpdates.locations = Number(locations);
    if (address !== undefined) {
      profileUpdates.address = {
        ...address,
      };
    }
    if (currentIsp !== undefined) profileUpdates.currentIsp = currentIsp;
    if (monthlyBudget !== undefined) profileUpdates.monthlyBudget = Number(monthlyBudget);
    if (preferredLanguage !== undefined) profileUpdates.preferredLanguage = preferredLanguage;

    let updatedProfile = await BusinessProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: profileUpdates },
      { new: true, runValidators: true, upsert: true }
    );

    const updatedUser = await User.findById(req.user._id).select('-password');
    const overallKycStatus = updatedProfile.kycStatus || ((updatedProfile.hasGstin || updatedProfile.hasUdyam) ? 'VERIFIED' : 'NOT_STARTED');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        ...updatedProfile.toObject(),
        user: {
          id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          agencyName: updatedUser.agencyName || '',
          partnerCode: updatedUser.partnerCode || '',
          territoryCircle: updatedUser.territoryCircle || 'Delhi NCR',
          isAvailable: updatedUser.isAvailable ?? true,
          availabilityStatus: updatedUser.availabilityStatus || 'AVAILABLE',
          activeAssignedLeadsCount: updatedUser.activeAssignedLeadsCount || 0,
        },
        businessProfile: updatedProfile,
        kyc: {
          status: overallKycStatus,
          isCompleted: overallKycStatus === 'VERIFIED',
          verifiedAt: updatedProfile.kycVerifiedAt,
          documentType: updatedProfile.kycDocumentType || (updatedProfile.hasGstin ? 'GST_CERTIFICATE' : ''),
          verifiedIdentifier: updatedProfile.kycVerifiedIdentifier || updatedProfile.gstin || updatedProfile.udyamNumber || '',
        },
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

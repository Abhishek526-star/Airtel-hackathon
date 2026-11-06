const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BusinessProfile = require('../models/BusinessProfile');
const env = require('../config/env');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

// @desc    Register a new user & create initial profile
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role,
      businessName,
      segment,
      cityTier,
      agencyName,
      territoryCircle,
      partnerCode,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email 
          ? 'An account with this email address already exists.' 
          : 'An account with this phone number already exists.',
        data: null,
        error: { code: 'USER_EXISTS' },
      });
    }

    const assignedRole = role && ['customer', 'partner', 'admin'].includes(role) ? role : 'customer';
    const isPartner = assignedRole === 'partner';

    const circleClean = (territoryCircle || 'DEL').slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const assignedPartnerCode = isPartner
      ? (partnerCode && partnerCode.trim() ? partnerCode.trim().toUpperCase() : `CP-${circleClean}-${randomSuffix}`)
      : '';
    const assignedAgencyName = isPartner ? (agencyName?.trim() || `${fullName} Enterprise Solutions`) : '';
    const assignedTerritory = isPartner ? (territoryCircle?.trim() || 'Delhi NCR') : 'Delhi NCR';

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: assignedRole,
      agencyName: assignedAgencyName,
      partnerCode: assignedPartnerCode,
      territoryCircle: assignedTerritory,
    });

    // Create associated BusinessProfile
    const profile = await BusinessProfile.create({
      user: user._id,
      tradeName: isPartner ? assignedAgencyName : (businessName || `${fullName}'s Business`),
      legalName: isPartner ? assignedAgencyName : (businessName || ''),
      segment: isPartner ? 'Telecom Channel Partner' : (segment || 'Micro Retail and Services'),
      address: {
        cityTier: cityTier || 'Tier 1',
      },
    });

    user.businessProfile = profile._id;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: isPartner 
        ? 'Channel Partner account registered successfully. Welcome to Airtel SYNC Partner Network.'
        : 'Account registered successfully. Welcome to Project Udyam Digital.',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          agencyName: user.agencyName,
          partnerCode: user.partnerCode,
          territoryCircle: user.territoryCircle,
          businessProfile: profile,
        },
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone and password.',
        data: null,
        error: { code: 'MISSING_CREDENTIALS' },
      });
    }

    // Search by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    })
      .select('+password')
      .populate('businessProfile');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/phone and password.',
        data: null,
        error: { code: 'INVALID_CREDENTIALS' },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/phone and password.',
        data: null,
        error: { code: 'INVALID_CREDENTIALS' },
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          agencyName: user.agencyName,
          partnerCode: user.partnerCode,
          territoryCircle: user.territoryCircle,
          businessProfile: user.businessProfile,
        },
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user & profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('businessProfile');
    res.status(200).json({
      success: true,
      message: 'Session verified.',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          agencyName: user.agencyName,
          partnerCode: user.partnerCode,
          territoryCircle: user.territoryCircle,
          businessProfile: user.businessProfile,
        },
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};


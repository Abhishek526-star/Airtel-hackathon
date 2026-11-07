const KYCDocument = require('../models/KYCDocument');
const BusinessProfile = require('../models/BusinessProfile');
const Order = require('../models/Order');
const User = require('../models/User');
const AssistanceRequest = require('../models/AssistanceRequest');
const kycService = require('../services/kyc/kycService');

// Helper: Dynamically match & assign a certified Smart KYC Partner
const assignKycPartnerForCustomer = async (user, profile, kycDoc, issueNotes, docType, extractedId) => {
  try {
    const customerCircle = (profile && profile.address && profile.address.city)
      ? (profile.address.city.includes('Delhi') ? 'Delhi NCR' : profile.address.city)
      : 'Delhi NCR';

    // 1. Prioritize available dedicated Smart KYC partner in circle
    let partner = await User.findOne({
      role: 'partner',
      partnerCode: /^KYC-/i,
      territoryCircle: new RegExp(customerCircle, 'i'),
      availabilityStatus: 'AVAILABLE',
    }).sort({ activeAssignedLeadsCount: 1 });

    // 2. If none, match any partner in circle who is AVAILABLE
    if (!partner) {
      partner = await User.findOne({
        role: 'partner',
        territoryCircle: new RegExp(customerCircle, 'i'),
        availabilityStatus: 'AVAILABLE',
      }).sort({ activeAssignedLeadsCount: 1 });
    }

    // 3. Fallback to any non-offline partner in circle
    if (!partner) {
      partner = await User.findOne({
        role: 'partner',
        territoryCircle: new RegExp(customerCircle, 'i'),
        availabilityStatus: { $ne: 'OFFLINE' },
      }).sort({ activeAssignedLeadsCount: 1 });
    }

    // 4. Fallback to any available Smart KYC partner across all circles
    if (!partner) {
      partner = await User.findOne({
        role: 'partner',
        partnerCode: /^KYC-/i,
        isAvailable: true,
      }).sort({ activeAssignedLeadsCount: 1 });
    }

    // 5. Ultimate fallback to any registered partner
    if (!partner) {
      partner = await User.findOne({ role: 'partner' }).sort({ activeAssignedLeadsCount: 1 });
    }

    if (!partner) return null;

    const circleClean = (customerCircle || 'DEL').slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const requestId = `REQ-KYC-${circleClean}-${randomSuffix}`;

    const request = await AssistanceRequest.create({
      requestId,
      customer: user._id,
      customerName: user.fullName,
      customerPhone: user.phone,
      customerEmail: user.email,
      businessName: profile?.tradeName || `${user.fullName}'s Business`,
      locationCircle: customerCircle,
      requestType: 'KYC_ASSISTANCE',
      kycDocument: kycDoc ? kycDoc._id : null,
      documentType: docType || kycDoc?.documentType || 'GST_CERTIFICATE',
      ocrExtractedId: extractedId || kycDoc?.ocrExtractedData?.extractedId || '',
      verificationIssue: issueNotes || kycDoc?.verificationNotes || 'Smart KYC Assisted Verification Required',
      assignedPartner: partner._id,
      assignedPartnerName: partner.fullName,
      assignedPartnerAgency: partner.agencyName || 'Airtel SmartKYC Assisted Onboarding Agency',
      assignedPartnerPhone: partner.phone,
      assignedPartnerCode: partner.partnerCode || 'KYC-DEL-101',
      status: 'NEW_ASSIGNED',
      notes: issueNotes || 'Customer flagged for on-site Smart KYC partner verification.',
    });

    // Increment partner load
    partner.activeAssignedLeadsCount = (partner.activeAssignedLeadsCount || 0) + 1;
    await partner.save();

    const partnerDetails = {
      name: partner.fullName,
      phone: partner.phone,
      partnerCode: partner.partnerCode || 'KYC-DEL-101',
      agencyName: partner.agencyName || 'Airtel SmartKYC Assisted Onboarding Agency',
      territoryCircle: partner.territoryCircle || customerCircle,
    };

    if (kycDoc) {
      kycDoc.assignedKycPartner = partner._id;
      kycDoc.assignedPartnerDetails = partnerDetails;
      kycDoc.assistanceRequestId = requestId;
      await kycDoc.save();
    }

    return { request, partnerDetails };
  } catch (err) {
    console.warn('[Smart KYC Partner Auto-Assignment Error]', err.message);
    return null;
  }
};

// @desc    Submit DPDP Act 2023 Digital Consent
// @route   POST /api/kyc/consent
// @access  Private
exports.submitConsent = async (req, res, next) => {
  try {
    const { consentGiven = true, purpose = 'Verification of Telecom Subscriber & Business Identity' } = req.body;

    if (!consentGiven) {
      return res.status(400).json({
        success: false,
        message: 'Explicit consent is mandatory under the DPDP Act 2023 to proceed with digital KYC.',
        data: null,
        error: { code: 'CONSENT_REQUIRED' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'DPDP consent recorded successfully.',
      data: {
        consentGiven: true,
        purpose,
        timestamp: new Date(),
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload document & run Smart KYC OCR extraction & verification
// @route   POST /api/kyc/upload
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file uploaded. Please upload a PDF or image file.',
        data: null,
        error: { code: 'NO_FILE' },
      });
    }

    const { manualId, documentType: clientDocType, orderId } = req.body;
    const profile = await BusinessProfile.findOne({ user: req.user._id });

    // Step 1: Run OCR / Identifier Extraction
    const extraction = kycService.extractEntityDetails(req.file.originalname, req.body.rawText || '');
    const activeId = manualId ? manualId.trim().toUpperCase() : extraction.extractedId;
    const activeDocType = clientDocType || extraction.documentType;

    // Step 2: Validate against Mock Registry
    const verification = await kycService.verifyDocument(
      activeDocType,
      activeId,
      profile ? profile.tradeName : ''
    );

    // Step 3: Persist KYC Document Record
    const kycDoc = await KYCDocument.create({
      user: req.user._id,
      businessProfile: profile ? profile._id : null,
      documentType: activeDocType,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      dpdpConsentGiven: true,
      dpdpConsentTimestamp: new Date(),
      ocrExtractedData: {
        rawText: `Extracted from ${req.file.originalname}`,
        extractedId: activeId || '',
        extractedName: verification.registryValidation?.matchedRecord?.legalName || (profile ? profile.tradeName : ''),
        confidenceScore: extraction.confidenceScore,
      },
      registryValidation: verification.registryValidation,
      verificationStatus: verification.verificationStatus,
      verificationNotes: verification.verificationNotes,
    });

    // Update profile with verified GSTIN/Udyam if verified
    if (profile) {
      if (verification.verificationStatus === 'VERIFIED') {
        profile.kycStatus = 'VERIFIED';
        profile.kycVerifiedAt = new Date();
        profile.kycDocumentType = activeDocType;
        profile.kycVerifiedIdentifier = activeId;

        if (activeDocType === 'GST_CERTIFICATE') {
          profile.hasGstin = true;
          profile.gstin = activeId;
          profile.legalName = verification.registryValidation?.matchedRecord?.legalName || profile.legalName;
        } else if (activeDocType === 'UDYAM_CERTIFICATE') {
          profile.hasUdyam = true;
          profile.udyamNumber = activeId;
        }
      } else if (verification.verificationStatus === 'NEEDS_REVIEW' && profile.kycStatus !== 'VERIFIED') {
        profile.kycStatus = 'NEEDS_REVIEW';
      } else if (verification.verificationStatus === 'REJECTED' && profile.kycStatus !== 'VERIFIED') {
        profile.kycStatus = 'REJECTED';
      }
      await profile.save();
    }

    // If an orderId was supplied, update order KYC status
    if (orderId) {
      const order = await Order.findOne({
        $or: [{ orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }],
      });
      if (order) {
        order.kycStatus = verification.verificationStatus;
        if (verification.verificationStatus === 'VERIFIED') {
          order.orderStatus = 'KYC_VERIFIED';
          order.timeline.push({
            status: 'KYC_VERIFIED',
            title: 'Smart KYC Instant Verification Succeeded',
            description: verification.verificationNotes,
            timestamp: new Date(),
          });
        }
        await order.save();
      }
    }

    // Auto-assign Smart KYC Partner if verification needs review or has discrepancy
    let assignedPartnerInfo = null;
    if (verification.verificationStatus === 'NEEDS_REVIEW' || verification.verificationStatus === 'REJECTED') {
      const assignment = await assignKycPartnerForCustomer(
        req.user,
        profile,
        kycDoc,
        verification.verificationNotes,
        activeDocType,
        activeId
      );
      if (assignment) {
        assignedPartnerInfo = assignment.partnerDetails;
      }
    }

    res.status(200).json({
      success: true,
      message: verification.verificationNotes,
      data: {
        documentId: kycDoc._id,
        verificationStatus: verification.verificationStatus,
        extractedId: activeId,
        documentType: activeDocType,
        registryValidation: verification.registryValidation,
        assignedPartner: assignedPartnerInfo || (kycDoc.assignedPartnerDetails?.name ? kycDoc.assignedPartnerDetails : null),
        assistanceRequestId: kycDoc.assistanceRequestId,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Explicitly request and assign an on-site Smart KYC Partner visit
// @route   POST /api/kyc/assign-partner
// @access  Private
exports.assignPartner = async (req, res, next) => {
  try {
    const { documentType, notes } = req.body;
    const profile = await BusinessProfile.findOne({ user: req.user._id });
    const latestDoc = await KYCDocument.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    const assignment = await assignKycPartnerForCustomer(
      req.user,
      profile,
      latestDoc,
      notes || 'Customer requested in-person Smart KYC assisted onboarding.',
      documentType || latestDoc?.documentType || 'GST_CERTIFICATE',
      latestDoc?.ocrExtractedData?.extractedId || ''
    );

    if (!assignment) {
      return res.status(503).json({
        success: false,
        message: 'No Smart KYC partners are currently registered in your circle.',
        data: null,
        error: { code: 'NO_KYC_PARTNER_AVAILABLE' },
      });
    }

    res.status(200).json({
      success: true,
      message: `Smart KYC Partner ${assignment.partnerDetails.name} assigned to your premises.`,
      data: {
        request: assignment.request,
        assignedPartner: assignment.partnerDetails,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's KYC verification status
// @route   GET /api/kyc/status
// @access  Private
exports.getStatus = async (req, res, next) => {
  try {
    const documents = await KYCDocument.find({ user: req.user._id }).sort({ createdAt: -1 });
    const profile = await BusinessProfile.findOne({ user: req.user._id });

    let overallStatus = 'NOT_STARTED';

    if (profile?.kycStatus === 'VERIFIED' || profile?.hasGstin || profile?.hasUdyam) {
      overallStatus = 'VERIFIED';
      if (profile && profile.kycStatus !== 'VERIFIED') {
        profile.kycStatus = 'VERIFIED';
        if (!profile.kycVerifiedAt) profile.kycVerifiedAt = new Date();
        if (!profile.kycVerifiedIdentifier) {
          profile.kycVerifiedIdentifier = profile.gstin || profile.udyamNumber || '';
        }
        await profile.save();
      }
    } else if (documents.length > 0) {
      if (documents.some((d) => d.verificationStatus === 'VERIFIED')) {
        overallStatus = 'VERIFIED';
        if (profile && profile.kycStatus !== 'VERIFIED') {
          profile.kycStatus = 'VERIFIED';
          profile.kycVerifiedAt = documents.find((d) => d.verificationStatus === 'VERIFIED').createdAt;
          await profile.save();
        }
      } else if (documents.some((d) => d.verificationStatus === 'NEEDS_REVIEW')) {
        overallStatus = 'NEEDS_REVIEW';
      } else if (documents.some((d) => d.verificationStatus === 'REJECTED')) {
        overallStatus = 'REJECTED';
      } else {
        overallStatus = 'PROCESSING';
      }
    }

    const verifiedDoc = documents.find((d) => d.verificationStatus === 'VERIFIED');
    const kycVerifiedAt = profile?.kycVerifiedAt || verifiedDoc?.createdAt || null;
    const kycDocumentType = profile?.kycDocumentType || verifiedDoc?.documentType || (profile?.hasGstin ? 'GST_CERTIFICATE' : (profile?.hasUdyam ? 'UDYAM_CERTIFICATE' : ''));
    const kycVerifiedIdentifier = profile?.kycVerifiedIdentifier || profile?.gstin || profile?.udyamNumber || verifiedDoc?.ocrExtractedData?.extractedId || '';

    // Check for active assistance request or assigned KYC partner
    const activeKycRequest = await AssistanceRequest.findOne({
      customer: req.user._id,
      requestType: 'KYC_ASSISTANCE',
      status: { $in: ['NEW_ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'] },
    }).sort({ createdAt: -1 });

    const latestDoc = documents[0];
    const assignedPartner = activeKycRequest ? {
      name: activeKycRequest.assignedPartnerName,
      phone: activeKycRequest.assignedPartnerPhone,
      partnerCode: activeKycRequest.assignedPartnerCode,
      agencyName: activeKycRequest.assignedPartnerAgency,
      territoryCircle: activeKycRequest.locationCircle,
      status: activeKycRequest.status,
      requestId: activeKycRequest.requestId,
    } : (latestDoc?.assignedPartnerDetails?.name ? latestDoc.assignedPartnerDetails : null);

    res.status(200).json({
      success: true,
      message: 'KYC status retrieved.',
      data: {
        overallStatus,
        kycStatus: overallStatus,
        kycVerifiedAt,
        kycDocumentType,
        kycVerifiedIdentifier,
        hasGstin: profile ? profile.hasGstin : false,
        gstin: profile ? profile.gstin : '',
        hasUdyam: profile ? profile.hasUdyam : false,
        udyamNumber: profile ? profile.udyamNumber : '',
        legalName: profile?.legalName || '',
        tradeName: profile?.tradeName || '',
        businessProfile: profile,
        documents,
        assignedPartner,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};


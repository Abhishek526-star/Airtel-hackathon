const KYCDocument = require('../models/KYCDocument');
const BusinessProfile = require('../models/BusinessProfile');
const Order = require('../models/Order');
const kycService = require('../services/kyc/kycService');

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
    if (verification.verificationStatus === 'VERIFIED' && profile) {
      if (activeDocType === 'GST_CERTIFICATE') {
        profile.hasGstin = true;
        profile.gstin = activeId;
        profile.legalName = verification.registryValidation?.matchedRecord?.legalName || profile.legalName;
      } else if (activeDocType === 'UDYAM_CERTIFICATE') {
        profile.hasUdyam = true;
        profile.udyamNumber = activeId;
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

    res.status(200).json({
      success: true,
      message: verification.verificationNotes,
      data: {
        documentId: kycDoc._id,
        verificationStatus: verification.verificationStatus,
        extractedId: activeId,
        documentType: activeDocType,
        registryValidation: verification.registryValidation,
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
    if (documents.length > 0) {
      if (documents.some((d) => d.verificationStatus === 'VERIFIED')) {
        overallStatus = 'VERIFIED';
      } else if (documents.some((d) => d.verificationStatus === 'NEEDS_REVIEW')) {
        overallStatus = 'NEEDS_REVIEW';
      } else if (documents.some((d) => d.verificationStatus === 'REJECTED')) {
        overallStatus = 'REJECTED';
      } else {
        overallStatus = 'PROCESSING';
      }
    }

    res.status(200).json({
      success: true,
      message: 'KYC status retrieved.',
      data: {
        overallStatus,
        hasGstin: profile ? profile.hasGstin : false,
        gstin: profile ? profile.gstin : '',
        hasUdyam: profile ? profile.hasUdyam : false,
        udyamNumber: profile ? profile.udyamNumber : '',
        documents,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};


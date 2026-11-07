const mongoose = require('mongoose');

const kycDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    businessProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessProfile',
    },
    documentType: {
      type: String,
      enum: ['GST_CERTIFICATE', 'UDYAM_CERTIFICATE', 'TRADE_LICENSE', 'UTILITY_BILL', 'SIGNATORY_ID'],
      default: 'GST_CERTIFICATE',
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
    dpdpConsentGiven: {
      type: Boolean,
      default: false,
    },
    dpdpConsentTimestamp: {
      type: Date,
    },
    ocrExtractedData: {
      rawText: { type: String, default: '' },
      extractedName: { type: String, default: '' },
      extractedId: { type: String, default: '' },
      extractedAddress: { type: String, default: '' },
      signatoryName: { type: String, default: '' },
      confidenceScore: { type: Number, default: 0.95 },
    },
    registryValidation: {
      registryType: { type: String, default: 'GSTIN' },
      statusFound: { type: String, default: 'UNKNOWN' },
      matchedRecord: { type: mongoose.Schema.Types.Mixed, default: null },
      isNameMatch: { type: Boolean, default: false },
      isStatusActive: { type: Boolean, default: false },
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'NEEDS_REVIEW', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    assignedKycPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedPartnerDetails: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      partnerCode: { type: String, default: '' },
      agencyName: { type: String, default: '' },
      territoryCircle: { type: String, default: 'Delhi NCR' },
    },
    assistanceRequestId: {
      type: String,
      default: '',
      index: true,
    },
    partnerOverride: {
      isOverridden: { type: Boolean, default: false },
      partnerName: { type: String, default: '' },
      reason: { type: String, default: '' },
      overrideTimestamp: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('KYCDocument', kycDocumentSchema);


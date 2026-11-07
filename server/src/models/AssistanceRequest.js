const mongoose = require('mongoose');

const assistanceRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      default: '',
    },
    businessName: {
      type: String,
      trim: true,
      default: '',
    },
    locationCircle: {
      type: String,
      required: true,
      trim: true,
      default: 'Delhi NCR',
      index: true,
    },
    requestType: {
      type: String,
      enum: ['KYC_ASSISTANCE', 'FIELD_VISIT', 'QUOTE_REVIEW', 'GENERAL_ASSISTANCE'],
      default: 'KYC_ASSISTANCE',
      index: true,
    },
    kycDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KYCDocument',
      index: true,
    },
    documentType: {
      type: String,
      default: '',
    },
    ocrExtractedId: {
      type: String,
      default: '',
    },
    verificationIssue: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    assignedPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedPartnerName: {
      type: String,
      default: '',
    },
    assignedPartnerAgency: {
      type: String,
      default: '',
    },
    assignedPartnerPhone: {
      type: String,
      default: '',
    },
    assignedPartnerCode: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['NEW_ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
      default: 'NEW_ASSIGNED',
      index: true,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AssistanceRequest', assistanceRequestSchema);


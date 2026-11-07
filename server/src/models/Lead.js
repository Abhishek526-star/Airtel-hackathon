const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    createdDate: {
      type: String,
    },
    leadSource: {
      type: String,
      default: 'Website form',
    },
    businessName: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      default: '',
    },
    segment: {
      type: String,
      index: true,
    },
    city: {
      type: String,
      default: '',
    },
    cityTier: {
      type: String,
      default: '1',
      index: true,
    },
    state: {
      type: String,
      default: '',
    },
    preferredLanguage: {
      type: String,
      default: 'English',
    },
    employeeCount: {
      type: Number,
      default: 1,
    },
    numSites: {
      type: Number,
      default: 1,
    },
    annualTurnoverBand: {
      type: String,
      default: '',
    },
    hasGstin: {
      type: Boolean,
      default: false,
      index: true,
    },
    gstin: {
      type: String,
      default: '',
    },
    hasUdyam: {
      type: Boolean,
      default: false,
    },
    udyamNumber: {
      type: String,
      default: '',
    },
    currentInternet: {
      type: String,
      default: '',
    },
    currentProvider: {
      type: String,
      default: '',
    },
    monthlyTelecomSpendInr: {
      type: Number,
      default: 0,
    },
    productsOfInterest: {
      type: String,
      default: '',
    },
    contactName: {
      type: String,
      default: '',
    },
    contactRole: {
      type: String,
      default: '',
    },
    stageReached: {
      type: String,
      enum: ['Lead', 'Contacted', 'Needs assessed', 'Quote accepted', 'KYC complete', 'Activated'],
      default: 'Lead',
      index: true,
    },
    outcome: {
      type: String,
      enum: ['Activated', 'Dropped'],
      default: 'Dropped',
      index: true,
    },
    dropReason: {
      type: String,
      default: 'None',
    },
    daysLeadToActivation: {
      type: Number,
      default: null,
    },
    customerFollowUpCalls: {
      type: Number,
      default: 0,
    },
    bundleProducts: {
      type: String,
      default: '',
    },
    monthlyBundleValueInr: {
      type: Number,
      default: 0,
    },
    oneTimeSetupInr: {
      type: Number,
      default: 0,
    },
    contractMonths: {
      type: Number,
      default: 12,
    },
    churnedWithin6Months: {
      type: Boolean,
      default: false,
    },
    npsScore: {
      type: Number,
      default: null,
    },
    acquisitionCostInr: {
      type: Number,
      default: 15000,
    },
    // Derived partner assignment
    assignedPartner: {
      type: String,
      default: 'Amit Verma (Accel Channel Partner)',
    },
    assignedPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedPartnerCode: {
      type: String,
      default: '',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    businessProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessProfile',
      index: true,
    },
    contactPhone: {
      type: String,
      default: '9810123456',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    recoveryStatus: {
      type: String,
      enum: ['NEW_ASSIGNED', 'CONTACTED', 'IN_PROGRESS', 'DOCUMENTS_PENDING', 'PHYSICAL_VISIT_SCHEDULED', 'RESOLVED', 'LOST'],
      default: 'NEW_ASSIGNED',
      index: true,
    },
    pendingRequirements: [{ type: String }],
    recoveryActions: [
      {
        actionType: {
          type: String,
          enum: [
            'PHONE_CALL',
            'WHATSAPP_FOLLOWUP',
            'PHYSICAL_SITE_VISIT',
            'DOCUMENT_COLLECTED',
            'KYC_OVERRIDE_APPROVED',
            'STATUS_CHANGE',
            'GENERAL_REMARK',
          ],
          default: 'GENERAL_REMARK',
        },
        performedBy: { type: String, default: '' },
        partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        partnerCode: { type: String, default: '' },
        remarks: { type: String, default: '' },
        statusAfter: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    accessAuditLog: [
      {
        action: { type: String, required: true },
        performedBy: { type: String, required: true },
        partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        partnerCode: { type: String, default: '' },
        partnerRole: { type: String, default: 'partner' },
        details: { type: String, default: '' },
        ipAddress: { type: String, default: '127.0.0.1' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    propensityScore: {
      type: Number,
      default: 75,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);

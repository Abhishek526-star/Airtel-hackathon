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
    propensityScore: {
      type: Number,
      default: 75,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);

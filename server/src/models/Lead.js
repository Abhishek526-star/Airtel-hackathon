const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    segment: {
      type: String,
      enum: [
        'Micro Retail and Services',
        'Professional Offices',
        'Small Multi-site Businesses',
        'Small Manufacturers',
      ],
      index: true,
    },
    city: {
      type: String,
      default: 'Delhi NCR',
    },
    cityTier: {
      type: String,
      enum: ['Tier 1', 'Tier 2', 'Tier 3'],
      default: 'Tier 1',
      index: true,
    },
    leadSource: {
      type: String,
      default: 'Direct Digital (Web/Ad)',
    },
    hasGstin: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Lead Ingested',
        'Quote Generated',
        'Quote Abandoned',
        'KYC Dropped',
        'Installation Dropped',
        'Lead Cold',
        'Activated',
      ],
      default: 'Lead Ingested',
      index: true,
    },
    dropReason: {
      type: String,
      default: 'None',
    },
    leadToActivationDays: {
      type: Number,
      default: null,
    },
    statusFollowUpCalls: {
      type: Number,
      default: 3,
    },
    blendedCacInr: {
      type: Number,
      default: 15000,
    },
    monthlyBundleValueInr: {
      type: Number,
      default: 1499,
    },
    npsScore: {
      type: Number,
      default: 7,
    },
    assignedPartner: {
      type: String,
      default: 'Amit Verma (Airtel Channel Partner)',
    },
    propensityScore: {
      type: Number,
      default: 75,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);

const mongoose = require('mongoose');

const businessProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    legalName: {
      type: String,
      trim: true,
      default: '',
    },
    tradeName: {
      type: String,
      required: [true, 'Trade or Business name is required'],
      trim: true,
    },
    segment: {
      type: String,
      enum: [
        'Micro Retail and Services',
        'Professional Offices',
        'Small Multi-site Businesses',
        'Small Manufacturers',
      ],
      default: 'Micro Retail and Services',
      index: true,
    },
    industry: {
      type: String,
      trim: true,
      default: 'General Retail / Trading',
    },
    employees: {
      type: Number,
      default: 2,
      min: 1,
    },
    locations: {
      type: Number,
      default: 1,
      min: 1,
    },
    address: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: 'Delhi NCR' },
      state: { type: String, trim: true, default: 'Delhi' },
      pincode: { type: String, trim: true, default: '110001' },
      cityTier: {
        type: String,
        enum: ['Tier 1', 'Tier 2', 'Tier 3'],
        default: 'Tier 1',
        index: true,
      },
    },
    hasGstin: {
      type: Boolean,
      default: false,
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    hasUdyam: {
      type: Boolean,
      default: false,
    },
    udyamNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    currentIsp: {
      type: String,
      default: 'Local Cable Broadband / Mobile Hotspot',
    },
    monthlyBudget: {
      type: Number,
      default: 2000,
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BusinessProfile', businessProfileSchema);


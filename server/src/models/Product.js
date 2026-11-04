const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      default: 'per site',
    },
    priceMin: {
      type: Number,
      required: true,
      default: 0,
    },
    priceMax: {
      type: Number,
      default: 0,
    },
    monthlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    setupFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    contractDurationMonths: {
      type: Number,
      default: 12,
    },
    availableCityTiers: {
      type: [String],
      default: ['1', '2'],
    },
    minEmployees: {
      type: Number,
      default: 1,
    },
    minSites: {
      type: Number,
      default: 1,
    },
    requiresGstin: {
      type: Boolean,
      default: false,
    },
    dependencies: {
      type: [String],
      default: [],
    },
    typicalInstallDays: {
      type: Number,
      default: 5,
    },
    targetSegments: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);

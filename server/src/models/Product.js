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
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Broadband', 'Voice/Mobile', 'Cloud', 'Security', 'IoT'],
      index: true,
    },
    speedBandwidth: {
      type: String,
      default: 'N/A',
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
      enum: [12, 24, 36],
    },
    cityTier: {
      type: [String],
      default: ['Tier 1', 'Tier 2', 'Tier 3'],
    },
    gstinRequired: {
      type: Boolean,
      default: false,
    },
    minEmployees: {
      type: Number,
      default: 1,
    },
    dependencies: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    unitMonthlyPrice: {
      type: Number,
      required: true,
    },
    unitSetupFee: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const quoteSchema = new mongoose.Schema(
  {
    quoteId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    businessProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessProfile',
    },
    bundleName: {
      type: String,
      default: 'Customized MSME Business Bundle',
    },
    items: [quoteItemSchema],
    contractDurationMonths: {
      type: Number,
      default: 12,
      enum: [12, 24, 36],
    },
    baseMrc: {
      type: Number,
      required: true,
    },
    contractDiscountPercent: {
      type: Number,
      default: 0,
    },
    discountedMrc: {
      type: Number,
      required: true,
    },
    totalSetupFee: {
      type: Number,
      default: 0,
    },
    gstRatePercent: {
      type: Number,
      default: 18,
    },
    gstMrc: {
      type: Number,
      required: true,
    },
    gstSetup: {
      type: Number,
      default: 0,
    },
    totalMonthlyAmount: {
      type: Number,
      required: true,
    },
    totalOneTimePayable: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACCEPTED', 'EXPIRED'],
      default: 'DRAFT',
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days validity
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quote', quoteSchema);


const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: '' },
    productName: { type: String, required: true },
    description: { type: String, default: '' },
    sac: { type: String, default: '998412' },
    quantity: { type: Number, default: 1 },
    rate: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    taxable: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
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
    customerDetails: {
      name: { type: String, default: '' },
      tradeName: { type: String, default: '' },
      legalName: { type: String, default: '' },
      gstin: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: 'Delhi NCR' },
      state: { type: String, default: 'Delhi' },
      pincode: { type: String, default: '110001' },
    },
    issueDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'FAILED', 'REFUNDED'],
      default: 'PAID',
      index: true,
    },
    paymentReference: {
      type: String,
      default: () => 'TXN-INV-' + Math.floor(100000 + Math.random() * 900000),
    },
    paymentMode: {
      type: String,
      default: 'Corporate AutoPay Mandate (e-NACH)',
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    taxableAmount: {
      type: Number,
      required: true,
    },
    cgstAmount: {
      type: Number,
      required: true,
    },
    sgstAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      index: true,
    },
    items: [invoiceItemSchema],
    isIncremental: {
      type: Boolean,
      default: false,
    },
    pdfDownloadUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);


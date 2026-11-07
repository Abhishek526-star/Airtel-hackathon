const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
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
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      index: true,
    },
    invoiceNumber: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'REFUNDED', 'PENDING'],
      default: 'SUCCESS',
      index: true,
    },
    mode: {
      type: String,
      default: 'UPI AutoPay (e-Mandate)',
    },
    gateway: {
      type: String,
      default: 'Airtel Payments Bank / B2B Corporate Gateway',
    },
    gatewayRef: {
      type: String,
      default: () => 'APBGW-' + Math.floor(10000000 + Math.random() * 90000000),
    },
    failureReason: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);


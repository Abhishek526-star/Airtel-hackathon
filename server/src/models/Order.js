const mongoose = require('mongoose');

const orderTimelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
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
    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'ORDER_PLACED',
        'KYC_PENDING',
        'KYC_VERIFIED',
        'INSTALLATION_SCHEDULED',
        'INSTALLATION_IN_PROGRESS',
        'ACTIVATED',
        'CANCELLED',
      ],
      default: 'ORDER_PLACED',
      index: true,
    },
    kycStatus: {
      type: String,
      enum: [
        'NOT_STARTED',
        'CONSENT_PENDING',
        'DOCUMENTS_PENDING',
        'PROCESSING',
        'VERIFIED',
        'NEEDS_REVIEW',
        'REJECTED',
      ],
      default: 'NOT_STARTED',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SIMULATED_PAID'],
      default: 'SIMULATED_PAID',
    },
    paymentDetails: {
      transactionRef: { type: String, default: () => 'TXN-SIM-' + Math.floor(100000 + Math.random() * 900000) },
      paidAmount: { type: Number, required: true },
      paidAt: { type: Date, default: Date.now },
      mode: { type: String, default: 'Corporate Net Banking / Mandate (ECS)' },
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    installationDetails: {
      installationAddress: { type: String, default: '' },
      city: { type: String, default: 'Delhi NCR' },
      pincode: { type: String, default: '110001' },
      contactPerson: { type: String, default: '' },
      contactPhone: { type: String, default: '' },
      scheduledDate: { type: Date },
      timeSlot: { type: String, default: '10:00 AM - 01:00 PM' },
      assignedEngineer: {
        name: { type: String, default: 'Ramesh Kumar (Accel Enterprise Field Tech)' },
        phone: { type: String, default: '+91 98110 54321' },
        badgeId: { type: String, default: 'ENG-NCR-402' },
      },
    },
    serviceActivation: {
      activatedAt: { type: Date },
      circuitId: { type: String, default: '' },
      cpeSerialNumber: { type: String, default: '' },
      assignedStaticIp: { type: String, default: '' },
      slaUptimePercent: { type: Number, default: 99.8 },
    },
    timeline: [orderTimelineSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);


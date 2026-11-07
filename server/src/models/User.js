const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'partner', 'admin', 'technician'],
      default: 'customer',
      index: true,
    },
    // Partner & Technician credentials and assigned operational circle
    agencyName: {
      type: String,
      trim: true,
      default: '',
    },
    partnerCode: {
      type: String,
      trim: true,
      default: '',
    },
    badgeId: {
      type: String,
      trim: true,
      default: '',
    },
    specialization: {
      type: String,
      trim: true,
      default: '',
    },
    territoryCircle: {
      type: String,
      trim: true,
      default: 'Delhi NCR',
    },
    // Partner & Technician live availability status & load balancing
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'ON_TASK', 'OFFLINE'],
      default: 'AVAILABLE',
      index: true,
    },
    activeAssignedLeadsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    activeAssignedInstallationsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    businessProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessProfile',
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


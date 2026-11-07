const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');

const seedKycPartners = async () => {
  try {
    console.log('[Seed KYC Partners] Connecting to MongoDB Atlas...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed KYC Partners] Connected.');

    const kycPartners = [
      {
        fullName: 'Ananya Deshmukh',
        email: 'kyc.partner@accel.com',
        phone: '9871122338',
        password: 'Password@123',
        role: 'partner',
        agencyName: 'Airtel SmartKYC Assisted Onboarding Agency',
        partnerCode: 'KYC-DEL-101',
        territoryCircle: 'Delhi NCR',
        specialization: 'Smart KYC On-Site Verification & DPDP Compliance',
        isAvailable: true,
        availabilityStatus: 'AVAILABLE',
        activeAssignedLeadsCount: 0,
      },
      {
        fullName: 'Rohan Joshi',
        email: 'kyc.mumbai@accel.com',
        phone: '9820033445',
        password: 'Password@123',
        role: 'partner',
        agencyName: 'Mumbai Metro SmartKYC Agency',
        partnerCode: 'KYC-MUM-201',
        territoryCircle: 'Mumbai Metro',
        specialization: 'Smart KYC On-Site Verification & DPDP Compliance',
        isAvailable: true,
        availabilityStatus: 'AVAILABLE',
        activeAssignedLeadsCount: 0,
      },
      {
        fullName: 'Kavitha Swamy',
        email: 'kyc.blr@accel.com',
        phone: '9845044556',
        password: 'Password@123',
        role: 'partner',
        agencyName: 'Bengaluru Digital KYC Hub',
        partnerCode: 'KYC-BLR-301',
        territoryCircle: 'Bengaluru Urban',
        specialization: 'Smart KYC On-Site Verification & DPDP Compliance',
        isAvailable: true,
        availabilityStatus: 'AVAILABLE',
        activeAssignedLeadsCount: 0,
      },
    ];

    for (const p of kycPartners) {
      let existing = await User.findOne({ email: p.email });
      if (!existing) {
        await User.create(p);
        console.log(`[Seed KYC Partner] Created: ${p.fullName} (${p.email}) - Code: ${p.partnerCode}`);
      } else {
        existing.fullName = p.fullName;
        existing.phone = p.phone;
        existing.role = 'partner';
        existing.agencyName = p.agencyName;
        existing.partnerCode = p.partnerCode;
        existing.territoryCircle = p.territoryCircle;
        existing.specialization = p.specialization;
        existing.isAvailable = p.isAvailable;
        existing.availabilityStatus = p.availabilityStatus;
        existing.password = p.password;
        await existing.save();
        console.log(`[Seed KYC Partner] Updated: ${p.fullName} (${p.email}) - Code: ${p.partnerCode}`);
      }
    }

    console.log('[Seed KYC Partner] All Smart KYC Partner accounts successfully verified in MongoDB Atlas.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed KYC Partner Error]', error);
    process.exit(1);
  }
};

seedKycPartners();


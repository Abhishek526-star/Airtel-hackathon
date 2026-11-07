const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');

const seedTechnicians = async () => {
  try {
    console.log('[Seed Tech] Connecting to MongoDB Atlas...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed Tech] Connected.');

    const technicians = [
      {
        fullName: 'Ramesh Kumar',
        email: 'tech.ramesh@accel.com',
        phone: '9811054321',
        password: 'Password@123',
        role: 'technician',
        badgeId: 'ENG-DELHI-408',
        specialization: 'Fiber Splicing, GPON ONT & SD-WAN',
        territoryCircle: 'Delhi NCR',
        isAvailable: true,
        availabilityStatus: 'AVAILABLE',
        activeAssignedInstallationsCount: 0,
      },
      {
        fullName: 'Suresh Patil',
        email: 'tech.suresh@accel.com',
        phone: '9820054321',
        password: 'Password@123',
        role: 'technician',
        badgeId: 'ENG-MUM-502',
        specialization: 'Enterprise CPE & High-Bandwidth DIA',
        territoryCircle: 'Mumbai Metro',
        isAvailable: true,
        availabilityStatus: 'AVAILABLE',
        activeAssignedInstallationsCount: 0,
      },
      {
        fullName: 'Ganesh Iyer',
        email: 'tech.blr@accel.com',
        phone: '9845054321',
        password: 'Password@123',
        role: 'technician',
        badgeId: 'ENG-BLR-603',
        specialization: 'Direct Cloud Connect & SD-WAN',
        territoryCircle: 'Bengaluru Urban',
        isAvailable: true,
        availabilityStatus: 'AVAILABLE',
        activeAssignedInstallationsCount: 0,
      },
    ];

    for (const t of technicians) {
      let existing = await User.findOne({ email: t.email });
      if (!existing) {
        await User.create(t);
        console.log(`[Seed Tech] Created: ${t.fullName} (${t.email}) - Badge: ${t.badgeId}`);
      } else {
        existing.role = 'technician';
        existing.fullName = t.fullName;
        existing.phone = t.phone;
        existing.badgeId = t.badgeId;
        existing.specialization = t.specialization;
        existing.territoryCircle = t.territoryCircle;
        existing.isAvailable = t.isAvailable;
        existing.availabilityStatus = t.availabilityStatus;
        existing.password = t.password; // pre-save will rehash if modified
        await existing.save();
        console.log(`[Seed Tech] Updated: ${t.fullName} (${t.email}) - Badge: ${t.badgeId}`);
      }
    }

    console.log('[Seed Tech] All field technician accounts verified in database.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Tech Error]', error);
    process.exit(1);
  }
};

seedTechnicians();


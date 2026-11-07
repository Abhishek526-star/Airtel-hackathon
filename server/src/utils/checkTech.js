const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');

mongoose.connect(env.MONGODB_URI).then(async () => {
  const techs = await User.find({ role: 'technician' });
  console.log(techs.map(t => ({
    name: t.fullName,
    circle: t.territoryCircle,
    avail: t.isAvailable,
    status: t.availabilityStatus,
    load: t.activeAssignedInstallationsCount
  })));
  process.exit(0);
});


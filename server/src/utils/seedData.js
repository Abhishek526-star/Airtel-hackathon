const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const env = require('../config/env');
const Product = require('../models/Product');
const Lead = require('../models/Lead');
const User = require('../models/User');
const BusinessProfile = require('../models/BusinessProfile');

const seedAll = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB.');

    // 1. Seed Products from product_catalogue.csv
    const cataloguePath = path.join(__dirname, '../../../data/product_catalogue.csv');
    if (fs.existsSync(cataloguePath)) {
      console.log('[Seed] Seeding Products from product_catalogue.csv...');
      const products = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(cataloguePath)
          .pipe(csv())
          .on('data', (row) => {
            if (row.product_id) {
              const deps = row.dependencies && row.dependencies !== 'none'
                ? row.dependencies.split('|').map((d) => d.trim())
                : [];
              const tiers = row.city_tier ? row.city_tier.split('/').map((t) => t.trim()) : ['Tier 1'];

              products.push({
                productId: row.product_id.trim(),
                productName: row.product_name.trim(),
                category: row.category.trim(),
                speedBandwidth: row.speed_bandwidth ? row.speed_bandwidth.trim() : 'N/A',
                monthlyPrice: parseFloat(row.monthly_price) || 0,
                setupFee: parseFloat(row.setup_fee) || 0,
                contractDurationMonths: parseInt(row.contract_duration_months, 10) || 12,
                cityTier: tiers,
                gstinRequired: row.gstin_required === 'true',
                minEmployees: parseInt(row.min_employees, 10) || 1,
                dependencies: deps,
                description: row.description ? row.description.trim() : '',
                isActive: true,
              });
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      for (const prod of products) {
        await Product.findOneAndUpdate({ productId: prod.productId }, { $set: prod }, { upsert: true, new: true });
      }
      console.log(`[Seed] Seeded ${products.length} Products successfully.`);
    }

    // 2. Seed Default Demo Users
    console.log('[Seed] Seeding Demo Users...');

    // Demo Customer (Rajesh Gupta)
    let customerUser = await User.findOne({ email: 'rajesh@guptasupermart.in' });
    if (!customerUser) {
      customerUser = await User.create({
        fullName: 'Rajesh Gupta',
        email: 'rajesh@guptasupermart.in',
        phone: '9810123456',
        password: 'Password@123',
        role: 'customer',
      });

      const customerProfile = await BusinessProfile.create({
        user: customerUser._id,
        tradeName: 'Gupta Supermart',
        legalName: 'Gupta Enterprises Pvt Ltd',
        segment: 'Micro Retail and Services',
        industry: 'Grocery & FMCG Retail',
        employees: 3,
        locations: 1,
        address: {
          street: 'Plot 44, Block B, Sector 18',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301',
          cityTier: 'Tier 1',
        },
        hasGstin: true,
        gstin: '07AAAAA0000A1Z5',
        hasUdyam: true,
        udyamNumber: 'UDYAM-UP-28-0012345',
        currentIsp: 'Local Cable Broadband',
        monthlyBudget: 2500,
      });

      customerUser.businessProfile = customerProfile._id;
      await customerUser.save();
      console.log('[Seed] Created Demo Customer: rajesh@guptasupermart.in');
    }

    // Demo Partner (Amit Verma)
    let partnerUser = await User.findOne({ email: 'partner@accel.com' });
    if (!partnerUser) {
      partnerUser = await User.create({
        fullName: 'Amit Verma (Airtel Channel Partner)',
        email: 'partner@accel.com',
        phone: '9871122334',
        password: 'Password@123',
        role: 'partner',
      });
      console.log('[Seed] Created Demo Partner: partner@accel.com');
    }

    // Demo Admin (Priya Nair)
    let adminUser = await User.findOne({ email: 'admin@accel.com' });
    if (!adminUser) {
      adminUser = await User.create({
        fullName: 'Priya Nair (Airtel SME Growth Head)',
        email: 'admin@accel.com',
        phone: '9988776655',
        password: 'Password@123',
        role: 'admin',
      });
      console.log('[Seed] Created Demo Admin: admin@accel.com');
    }

    // 3. Seed 5,000 Leads from smb_leads.csv if Lead collection is empty
    const leadCount = await Lead.countDocuments();
    if (leadCount === 0) {
      const leadsPath = path.join(__dirname, '../../../data/smb_leads.csv');
      if (fs.existsSync(leadsPath)) {
        console.log('[Seed] Seeding 5,000 Leads from smb_leads.csv into MongoDB...');
        const leads = [];

        await new Promise((resolve, reject) => {
          fs.createReadStream(leadsPath)
            .pipe(csv())
            .on('data', (row) => {
              if (row.lead_id) {
                leads.push({
                  leadId: row.lead_id.trim(),
                  businessName: row.business_name.trim(),
                  segment: row.segment.trim(),
                  city: row.city.trim(),
                  cityTier: row.city_tier.trim(),
                  leadSource: row.lead_source.trim(),
                  hasGstin: row.has_gstin === 'true',
                  status: row.status.trim(),
                  dropReason: row.drop_reason ? row.drop_reason.trim() : 'None',
                  leadToActivationDays: row.lead_to_activation_days ? parseFloat(row.lead_to_activation_days) : null,
                  statusFollowUpCalls: parseInt(row.status_follow_up_calls, 10) || 3,
                  blendedCacInr: parseFloat(row.blended_cac_inr) || 15000,
                  monthlyBundleValueInr: parseFloat(row.monthly_bundle_value_inr) || 1499,
                  npsScore: parseInt(row.nps_score, 10) || 7,
                });
              }
            })
            .on('end', resolve)
            .on('error', reject);
        });

        if (leads.length > 0) {
          await Lead.insertMany(leads, { ordered: false });
          console.log(`[Seed] Seeded ${leads.length} Leads into MongoDB.`);
        }
      }
    } else {
      console.log(`[Seed] Lead collection already contains ${leadCount} records.`);
    }

    console.log('[Seed] All seeding operations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedAll();
}

module.exports = seedAll;

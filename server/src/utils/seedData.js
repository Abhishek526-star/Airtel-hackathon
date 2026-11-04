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

    // 1. Seed Products from company's official product_catalogue.csv
    const cataloguePath = path.join(__dirname, '../../../data/product_catalogue.csv');
    if (fs.existsSync(cataloguePath)) {
      console.log('[Seed] Seeding Products from official product_catalogue.csv...');
      const products = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(cataloguePath)
          .pipe(csv())
          .on('data', (row) => {
            if (row.product_id) {
              const deps = row.requires_one_of
                ? row.requires_one_of.split('|').map((d) => d.trim()).filter(Boolean)
                : [];
              const tiers = row.available_city_tiers
                ? row.available_city_tiers.split(';').map((t) => t.trim())
                : ['1', '2'];
              const segments = row.target_segments
                ? row.target_segments.split(';').map((s) => s.trim())
                : [];

              const minPrice = parseFloat(row.price_min_inr_per_month) || 0;
              const maxPrice = parseFloat(row.price_max_inr_per_month) || minPrice;

              products.push({
                productId: row.product_id.trim(),
                productName: row.product_name.trim(),
                category: row.category ? row.category.trim() : 'Connectivity',
                description: row.description ? row.description.trim() : '',
                unit: row.unit ? row.unit.trim() : 'per site',
                priceMin: minPrice,
                priceMax: maxPrice,
                monthlyPrice: minPrice,
                setupFee: parseFloat(row.one_time_setup_inr) || 0,
                contractDurationMonths: parseInt(row.min_contract_months, 10) || 12,
                availableCityTiers: tiers,
                minEmployees: parseInt(row.min_employees, 10) || 1,
                minSites: parseInt(row.min_sites, 10) || 1,
                requiresGstin: row.requires_gstin === 'Y',
                dependencies: deps,
                typicalInstallDays: parseInt(row.typical_install_days, 10) || 5,
                targetSegments: segments,
                isActive: true,
              });
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // Clear existing and re-insert official products
      await Product.deleteMany({});
      await Product.insertMany(products);
      console.log(`[Seed] Seeded ${products.length} Official Company Products (P01-P25).`);
    }

    // 2. Seed Official 5,000 Leads from company's smb_leads.csv
    const leadsPath = path.join(__dirname, '../../../data/smb_leads.csv');
    if (fs.existsSync(leadsPath)) {
      console.log('[Seed] Seeding 5,000 Official Leads from smb_leads.csv...');
      const leads = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(leadsPath)
          .pipe(csv())
          .on('data', (row) => {
            if (row.lead_id) {
              const hasGstin = row.has_gstin === 'Y';
              const hasUdyam = row.has_udyam === 'Y';
              const isActivated = row.outcome === 'Activated';

              leads.push({
                leadId: row.lead_id.trim(),
                createdDate: row.created_date || '',
                leadSource: row.lead_source || 'Website form',
                businessName: row.business_name || `SMB Lead ${row.lead_id}`,
                businessType: row.business_type || '',
                segment: row.segment || 'Micro retail & services',
                city: row.city || 'Kochi',
                cityTier: row.city_tier || '1',
                state: row.state || '',
                preferredLanguage: row.preferred_language || 'English',
                employeeCount: parseInt(row.employee_count, 10) || 1,
                numSites: parseInt(row.num_sites, 10) || 1,
                annualTurnoverBand: row.annual_turnover_band || '',
                hasGstin,
                gstin: row.gstin || '',
                hasUdyam,
                udyamNumber: row.udyam_number || '',
                currentInternet: row.current_internet || '',
                currentProvider: row.current_provider || '',
                monthlyTelecomSpendInr: parseFloat(row.monthly_telecom_spend_inr) || 0,
                productsOfInterest: row.products_of_interest || '',
                contactName: row.contact_name || '',
                contactRole: row.contact_role || '',
                stageReached: row.stage_reached || 'Lead',
                outcome: isActivated ? 'Activated' : 'Dropped',
                dropReason: row.drop_reason || 'None',
                daysLeadToActivation: row.days_lead_to_activation ? parseFloat(row.days_lead_to_activation) : null,
                customerFollowUpCalls: parseInt(row.customer_follow_up_calls, 10) || 0,
                bundleProducts: row.bundle_products || '',
                monthlyBundleValueInr: parseFloat(row.monthly_bundle_value_inr) || 0,
                oneTimeSetupInr: parseFloat(row.one_time_setup_inr) || 0,
                contractMonths: parseInt(row.contract_months, 10) || 12,
                churnedWithin6Months: row.churned_within_6_months === 'Y',
                npsScore: row.nps_score ? parseInt(row.nps_score, 10) : null,
                acquisitionCostInr: parseFloat(row.acquisition_cost_inr) || 15000,
                assignedPartner: 'Amit Verma (Accel Channel Partner)',
                propensityScore: hasGstin ? 85 : 55,
              });
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      await Lead.deleteMany({});
      await Lead.insertMany(leads);
      const activatedCount = leads.filter((l) => l.outcome === 'Activated').length;
      console.log(`[Seed] Seeded ${leads.length} Official Company Leads (${activatedCount} Activated).`);
    }

    // 3. Seed Demo Users mapped to company leads
    console.log('[Seed] Seeding Demo Users...');

    // Demo Customer 1: Saffron Bakers (from Lead L00002, Activated Customer)
    let customerUser = await User.findOne({ email: 'sneha@saffronbakers.in' });
    if (!customerUser) {
      customerUser = await User.create({
        fullName: 'Sneha Rao',
        email: 'sneha@saffronbakers.in',
        phone: '9810123456',
        password: 'Password@123',
        role: 'customer',
      });

      const customerProfile = await BusinessProfile.create({
        user: customerUser._id,
        tradeName: 'Saffron Bakers',
        legalName: 'Sneha Rao (Prop. Saffron Bakers)',
        segment: 'Micro Retail and Services',
        industry: 'Bakery & Confectionery',
        employees: 3,
        locations: 1,
        address: {
          street: 'Shop 83, Market Yard',
          city: 'Ludhiana',
          state: 'Punjab',
          pincode: '416059',
          cityTier: 'Tier 2',
        },
        hasGstin: true,
        gstin: '03PJNXS4821G1ZB',
        hasUdyam: false,
        currentIsp: 'Mobile Hotspot / Local Cable',
        monthlyBudget: 2500,
      });

      customerUser.businessProfile = customerProfile._id;
      await customerUser.save();
      console.log('[Seed] Created Demo Customer: sneha@saffronbakers.in (Lead L00002)');
    }

    // Keep Rajesh Gupta demo alias as well
    let rajeshUser = await User.findOne({ email: 'rajesh@guptasupermart.in' });
    if (!rajeshUser) {
      rajeshUser = await User.create({
        fullName: 'Rajesh Gupta',
        email: 'rajesh@guptasupermart.in',
        phone: '9810123457',
        password: 'Password@123',
        role: 'customer',
      });

      const rajeshProfile = await BusinessProfile.create({
        user: rajeshUser._id,
        tradeName: 'Balaji Dental Care',
        legalName: 'Balaji Dental Care LLP',
        segment: 'Professional Offices',
        industry: 'Healthcare / Dental Clinic',
        employees: 5,
        locations: 1,
        address: {
          street: 'Shop 164, Station Road',
          city: 'Kochi',
          state: 'Kerala',
          pincode: '289398',
          cityTier: 'Tier 2',
        },
        hasGstin: true,
        gstin: '32TTNXB7384T1ZW',
        hasUdyam: true,
        udyamNumber: 'UDYAM-KL-00-3078801',
        currentIsp: 'Competitor B',
        monthlyBudget: 3500,
      });

      rajeshUser.businessProfile = rajeshProfile._id;
      await rajeshUser.save();
      console.log('[Seed] Created Demo Customer: rajesh@guptasupermart.in');
    }

    // Demo Partner (Amit Verma)
    let partnerUser = await User.findOne({ email: 'partner@accel.com' });
    if (!partnerUser) {
      partnerUser = await User.create({
        fullName: 'Amit Verma (Accel Channel Partner)',
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
        fullName: 'Priya Nair (Accel SME Growth Head)',
        email: 'admin@accel.com',
        phone: '9988776655',
        password: 'Password@123',
        role: 'admin',
      });
      console.log('[Seed] Created Demo Admin: admin@accel.com');
    }

    console.log('[Seed] All seeding operations with company data completed successfully.');
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

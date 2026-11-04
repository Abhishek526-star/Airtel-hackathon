const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class MockRegistryService {
  constructor() {
    this.gstinRegistry = new Map();
    this.udyamRegistry = new Map();
    this.isLoaded = false;
    this.loadRegistries();
  }

  loadRegistries() {
    const dataDir = path.join(__dirname, '../../../../data');
    const gstinPath = path.join(dataDir, 'mock_gstin_registry.csv');
    const udyamPath = path.join(dataDir, 'mock_udyam_registry.csv');

    if (fs.existsSync(gstinPath)) {
      fs.createReadStream(gstinPath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.gstin) {
            this.gstinRegistry.set(row.gstin.trim().toUpperCase(), {
              gstin: row.gstin.trim().toUpperCase(),
              legalName: row.legal_name,
              tradeName: row.trade_name,
              status: row.status ? row.status.toUpperCase() : 'ACTIVE',
              registrationDate: row.registration_date,
              taxpayerType: row.taxpayer_type,
              address: row.address,
              city: row.city,
              state: row.state,
              pincode: row.pincode,
              authorizedSignatory: row.authorized_signatory,
            });
          }
        })
        .on('end', () => {
          console.log(`[MockRegistry] Loaded ${this.gstinRegistry.size} GSTIN records.`);
        });
    }

    if (fs.existsSync(udyamPath)) {
      fs.createReadStream(udyamPath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.udyam_number) {
            this.udyamRegistry.set(row.udyam_number.trim().toUpperCase(), {
              udyamNumber: row.udyam_number.trim().toUpperCase(),
              enterpriseName: row.enterprise_name,
              enterpriseType: row.enterprise_type,
              majorActivity: row.major_activity,
              status: row.status ? row.status.toUpperCase() : 'ACTIVE',
              city: row.city,
              state: row.state,
              pincode: row.pincode,
              authorizedSignatory: row.authorized_signatory,
              linkedGstin: row.linked_gstin,
            });
          }
        })
        .on('end', () => {
          console.log(`[MockRegistry] Loaded ${this.udyamRegistry.size} Udyam records.`);
          this.isLoaded = true;
        });
    }
  }

  lookupGSTIN(gstin) {
    if (!gstin) return null;
    const clean = gstin.trim().toUpperCase();
    return this.gstinRegistry.get(clean) || null;
  }

  lookupUdyam(udyam) {
    if (!udyam) return null;
    const clean = udyam.trim().toUpperCase();
    return this.udyamRegistry.get(clean) || null;
  }
}

const instance = new MockRegistryService();
module.exports = instance;

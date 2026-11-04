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
            const cleanGstin = row.gstin.trim().toUpperCase();
            this.gstinRegistry.set(cleanGstin, {
              gstin: cleanGstin,
              legalName: row.legal_name || row.trade_name || 'Business Entity',
              tradeName: row.trade_name || row.legal_name || 'Business Entity',
              constitution: row.constitution || 'Proprietorship',
              address: row.principal_place_of_business || '',
              state: row.state || '',
              registrationDate: row.registration_date || '',
              status: row.status ? row.status.toUpperCase() : 'ACTIVE',
            });
          }
        })
        .on('end', () => {
          console.log(`[MockRegistry] Loaded ${this.gstinRegistry.size} official company GSTIN records.`);
        });
    }

    if (fs.existsSync(udyamPath)) {
      fs.createReadStream(udyamPath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.udyam_number) {
            const cleanUdyam = row.udyam_number.trim().toUpperCase();
            this.udyamRegistry.set(cleanUdyam, {
              udyamNumber: cleanUdyam,
              enterpriseName: row.enterprise_name || 'MSME Enterprise',
              enterpriseType: row.enterprise_type || 'Micro',
              majorActivity: row.major_activity || 'Services',
              nicDescription: row.nic_description || '',
              state: row.state || '',
              city: row.city || '',
              registrationDate: row.date_of_registration || '',
              status: 'ACTIVE',
            });
          }
        })
        .on('end', () => {
          console.log(`[MockRegistry] Loaded ${this.udyamRegistry.size} official company Udyam records.`);
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

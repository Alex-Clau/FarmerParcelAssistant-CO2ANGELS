const fs = require('fs');
const path = require('path');
const Farmer = require('../../models/farmers');
const Parcel = require('../../models/parcels');
const ParcelIndices = require('../../models/parcel_indices');
const ReportFrequency = require('../../models/report_frequencies');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // read JSON files
    const dataDir = '/data'; //always '/data' when running in the container
    const farmersPath = path.join(dataDir, 'farmers.json');
    const parcelsPath = path.join(dataDir, 'parcels.json');
    const parcelIndicesPath = path.join(dataDir, 'parcel_indices.json');
    const reportFrequenciesPath = path.join(dataDir, 'report_frequencies.json');

    const farmersData = JSON.parse(fs.readFileSync(farmersPath, 'utf8'));
    const parcelsData = JSON.parse(fs.readFileSync(parcelsPath, 'utf8'));
    const parcelIndicesData = JSON.parse(fs.readFileSync(parcelIndicesPath, 'utf8'));
    const reportFrequenciesData = JSON.parse(fs.readFileSync(reportFrequenciesPath, 'utf8'));

    // seed farmers
    console.log('Seeding farmers...');
    for (const farmer of farmersData) {
      try {
        await Farmer.create(farmer);
        console.log(`Created farmer: ${farmer.id} - ${farmer.name}`);
      } catch (error) {
        if (error.code === '23505') { //unique constraint violation of sql
          console.log(`Farmer ${farmer.id} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    // seed parcels
    console.log('Seeding parcels...');
    for (const parcel of parcelsData) {
      try {
        await Parcel.create(parcel);
        console.log(`Created parcel: ${parcel.id} - ${parcel.name}`);
      } catch (error) {
        if (error.code === '23505') {
          console.log(`Parcel ${parcel.id} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    // seed parcel_indices
    console.log('Seeding parcel indices...');
    for (const [parcelId, indices] of Object.entries(parcelIndicesData)) {
      for (const index of indices) {
        try {
          await ParcelIndices.create({
            parcel_id: parcelId,
            date: index.date,
            ndvi: index.ndvi,
            ndmi: index.ndmi,
            ndwi: index.ndwi,
            soc: index.soc,
            nitrogen: index.nitrogen,
            phosphorus: index.phosphorus,
            potassium: index.potassium,
            ph: index.ph
          });
          console.log(`Created indices for ${parcelId} on ${index.date}`);
        } catch (error) {
          if (error.code === '23505') {
            console.log(`Indices for ${parcelId} on ${index.date} already exists, skipping...`);
          } else {
            throw error;
          }
        }
      }
    }

    // seed report frequencies (for testing /generate-reports endpoint)
    console.log('Seeding report frequencies...');
    for (const reportFreq of reportFrequenciesData) {
      try {
        await ReportFrequency.create(reportFreq);
        console.log(`Created report frequency for farmer ${reportFreq.farmer_id}`);
      } catch (error) {
        if (error.code === '23505') {
          console.log(`Report frequency for farmer ${reportFreq.farmer_id} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

//run the seed function
seedDatabase()
  .then(() => {
    console.log('Seeding process finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
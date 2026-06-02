/**
 * Migration Script: Fix monthlyCost for Existing MedicationTier Records
 *
 * Problem: Before the column mapping fix, all records were saved with
 * monthlyCost: 0 because the "30-day Cost" column wasn't mapped correctly.
 *
 * This script re-imports cost data from a source CSV/XLSX file and patches
 * all matched records in the database by medication name + strength.
 *
 * Usage (run once from project root):
 *   npx ts-node src/migrations/fixMonthlyCost.ts <path-to-source-file>
 *
 * Example:
 *   npx ts-node src/migrations/fixMonthlyCost.ts ./uploads/formulary.xlsx
 */
import mongoose from 'mongoose';
import path from 'path';
import { parseFile } from '../app/utils/fileParser';
import { mapTrialData } from '../app/utils/dataMapper';
import { MedicationTier } from '../app/modules/medicationTier/medicationTier.model';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('❌ Please provide the path to the source file as an argument.');
    console.error('   Example: npx ts-node src/migrations/fixMonthlyCost.ts ./formulary.xlsx');
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  const ext = path.extname(absolutePath).toLowerCase();
  let mimeType: string;

  if (ext === '.csv') {
    mimeType = 'text/csv';
  } else if (ext === '.xlsx') {
    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  } else if (ext === '.xls') {
    mimeType = 'application/vnd.ms-excel';
  } else {
    console.error(`❌ Unsupported file type: ${ext}. Only .csv, .xlsx, .xls are supported.`);
    process.exit(1);
  }

  const dbUri = process.env.DATABASE_URL || process.env.MONGODB_URI || '';
  if (!dbUri) {
    console.error('❌ No database URI found. Please set DATABASE_URL or MONGODB_URI in your .env');
    process.exit(1);
  }

  console.log('🔗 Connecting to database...');
  await mongoose.connect(dbUri);
  console.log('✅ Connected.\n');

  console.log(`📂 Parsing file: ${absolutePath}`);
  const rawData = await parseFile(absolutePath, mimeType);
  const mappedData = mapTrialData(rawData);

  let patched = 0;
  let skipped = 0;
  let notFound = 0;

  for (const record of mappedData) {
    // Only attempt to patch records that have a real cost value
    if (!record.monthlyCost || record.monthlyCost === 0) {
      skipped++;
      continue;
    }

    const filter: any = { medication: new RegExp(`^${record.medication}$`, 'i') };
    if (record.strength) {
      filter.strength = new RegExp(`^${record.strength}$`, 'i');
    }

    const result = await MedicationTier.updateMany(filter, {
      $set: { monthlyCost: record.monthlyCost },
    });

    if (result.matchedCount > 0) {
      console.log(
        `  ✅ Patched "${record.medication}" (${record.strength}) → monthlyCost: ${record.monthlyCost} [${result.modifiedCount} record(s) updated]`,
      );
      patched += result.modifiedCount;
    } else {
      console.log(
        `  ⚠️  Not found: "${record.medication}" (${record.strength})`,
      );
      notFound++;
    }
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`📊 Migration Summary:`);
  console.log(`   Patched:   ${patched} record(s)`);
  console.log(`   Skipped (cost was 0 or missing): ${skipped}`);
  console.log(`   Not found in DB: ${notFound}`);
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected. Migration complete.');
};

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

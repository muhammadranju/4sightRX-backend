import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Patient from '../app/modules/patient/patient.model';
import Medication from '../app/modules/medication/medication.model';
import Therapeutic from '../app/modules/therapeutic/therapeutic.model';
import {
  MedicationRoute,
  MedicationFrequency,
} from '../app/modules/medication/medication.interface';

const SESSION_ID = 'seed-session-001';

const seed = async () => {
  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/4sightrx';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // ── Cleanup existing seed data ─────────────────────────────────────────────
  await Promise.all([
    Patient.deleteMany({}),
    Medication.deleteMany({ sessionId: SESSION_ID }),
    Therapeutic.deleteMany({}),
  ]);
  console.log('🗑️  Cleared previous seed data');

  // ── 2. Patient ──────────────────────────────────────────────────────────────
  const patient = await Patient.create({
    firstName: 'Margaret',
    lastName: 'Thompson',
    patientIdMrn: 'MRN-45678',
    dateOfBirth: '1948-03-12',
    age: 78,
    gender: 'Female',
    phoneNumber: '+1-555-0100',
    medicationAllergies: 'Penicillin',
    admissionDate: '2026-01-28',
    notes: 'Hospice patient — comfort care focus',
  });
  console.log(
    `🧑‍⚕️ Patient created: ${patient.firstName} ${patient.lastName} (${patient._id})`,
  );

  // ── 3. Medications ──────────────────────────────────────────────────────────
  const medications = await Medication.insertMany([
    {
      patientId: patient._id,
      sessionId: SESSION_ID,
      medicationName: 'Atorvastatin',
      strength: '20mg',
      form: 'Tablet',
      dose: '1 tablet',
      route: MedicationRoute.ORAL,
      frequency: MedicationFrequency.ONCE_DAILY,
      source: 'manual',
      additionalInstructions: 'At bedtime',
    },
    {
      patientId: patient._id,
      sessionId: SESSION_ID,
      medicationName: 'Warfarin',
      strength: '5mg',
      form: 'Tablet',
      dose: '1 tablet',
      route: MedicationRoute.ORAL,
      frequency: MedicationFrequency.ONCE_DAILY,
      source: 'manual',
      additionalInstructions: 'Monitor INR weekly',
    },
    {
      patientId: patient._id,
      sessionId: SESSION_ID,
      medicationName: 'Lisinopril',
      strength: '10mg',
      form: 'Tablet',
      dose: '1 tablet',
      route: MedicationRoute.ORAL,
      frequency: MedicationFrequency.ONCE_DAILY,
      source: 'manual',
    },
  ]);
  console.log(
    `💊 ${medications.length} medications created for session: ${SESSION_ID}`,
  );

  // ── 4. Therapeutic Alternatives ─────────────────────────────────────────────
  await Therapeutic.insertMany([
    {
      drugName: 'atorvastatin', // stored lowercase
      alternative: 'Simvastatin',
      drugClass: 'Statin',
      estimatedSavings: 45,
    },
    {
      drugName: 'lisinopril', // stored lowercase
      alternative: 'Enalapril',
      drugClass: 'ACE Inhibitor',
      estimatedSavings: 30,
    },
  ]);
  console.log('🔄 Therapeutic alternatives seeded');

  console.log('\n🚀 Seed complete! Use these IDs in Postman:');
  console.log(`   patientId   : ${patient._id}`);
  console.log(`   medicationIds: ${medications.map(m => m._id).join(', ')}`);
  console.log(`   sessionId   : ${SESSION_ID}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

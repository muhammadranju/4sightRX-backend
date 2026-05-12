import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Patient from '../app/modules/patient/patient.model';
import Medication from '../app/modules/medication/medication.model';
import Therapeutic from '../app/modules/therapeutic/therapeutic.model';
import { Organization } from '../app/modules/organization/organization.model';
import { Sex, LifeExpectancy } from '../app/modules/patient/patient.interface';
import { PartialStatus } from '../enums/user';

const SESSION_ID = 'seed-session-001';

const seed = async () => {
  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/4sightrx';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // ── 1. Cleanup existing seed data ─────────────────────────────────────────────
  await Promise.all([
    Organization.deleteMany({ name: 'Seed Organization' }),
    Patient.deleteMany({}),
    Medication.deleteMany({ sessionId: SESSION_ID }),
    Therapeutic.deleteMany({}),
  ]);
  console.log('🗑️  Cleared previous seed data');

  // ── 2. Organization ─────────────────────────────────────────────────────────
  const org = await Organization.create({
    name: 'Seed Organization',
    email: 'contact@seedorg.com',
    status: 'active',
  });
  console.log(`🏢 Organization created: ${org.name} (${org._id})`);

  // ── 3. Patient ──────────────────────────────────────────────────────────────
  const patient = await Patient.create({
    organizationId: org._id,
    firstName: 'Margaret',
    lastName: 'Thompson',
    patientIdMrn: 'MRN-45678',
    dob: new Date('1948-03-12'),
    age: 78,
    sex: Sex.FEMALE,
    admissionDate: new Date('2026-01-28'),
    lifeExpectancy: LifeExpectancy.SIX_MONTHS,
    status: PartialStatus.ACTIVE,
    notes: 'Hospice patient — comfort care focus',
    allergies: [],
  });
  console.log(
    `🧑‍⚕️ Patient created: ${patient.firstName} ${patient.lastName} (${patient._id})`,
  );

  // ── 4. Medications ──────────────────────────────────────────────────────────
  const medications = await Medication.insertMany([
    {
      organizationId: org._id,
      patientId: patient._id,
      sessionId: SESSION_ID,
      medicationName: 'Atorvastatin',
      strength: '20mg',
      form: 'Tablet',
      dose: '1 tablet',
      route: 'Oral',
      frequency: 'Once Daily',
      source: 'manual',
      status: 'verified',
      additionalInstructions: 'At bedtime',
    },
    {
      organizationId: org._id,
      patientId: patient._id,
      sessionId: SESSION_ID,
      medicationName: 'Warfarin',
      strength: '5mg',
      form: 'Tablet',
      dose: '1 tablet',
      route: 'Oral',
      frequency: 'Once Daily',
      source: 'manual',
      status: 'verified',
      additionalInstructions: 'Monitor INR weekly',
    },
    {
      organizationId: org._id,
      patientId: patient._id,
      sessionId: SESSION_ID,
      medicationName: 'Lisinopril',
      strength: '10mg',
      form: 'Tablet',
      dose: '1 tablet',
      route: 'Oral',
      frequency: 'Once Daily',
      source: 'manual',
      status: 'verified',
    },
  ]);
  console.log(
    `💊 ${medications.length} medications created for session: ${SESSION_ID}`,
  );

  // ── 5. Therapeutic Alternatives ─────────────────────────────────────────────
  await Therapeutic.insertMany([
    {
      organizationId: org._id,
      drugName: 'atorvastatin',
      alternative: 'Simvastatin',
      drugClass: 'Statin',
      dosageEquivalence: '20mg Atorvastatin = 40mg Simvastatin',
      rationale: 'Cost-effective alternative for statin therapy',
      estimatedSavings: 45,
    },
    {
      organizationId: org._id,
      drugName: 'lisinopril',
      alternative: 'Enalapril',
      drugClass: 'ACE Inhibitor',
      dosageEquivalence: '10mg Lisinopril = 5mg Enalapril',
      rationale: 'Preferred alternative in local formulary',
      estimatedSavings: 30,
    },
  ]);
  console.log('🔄 Therapeutic alternatives seeded');

  console.log('\n🚀 Seed complete! Use these IDs in Postman:');
  console.log(`   organizationId: ${org._id}`);
  console.log(`   patientId     : ${patient._id}`);
  console.log(`   sessionId     : ${SESSION_ID}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

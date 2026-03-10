import { Schema, model } from 'mongoose';
import { Gender, INewPatient } from './patient.interface';

const patientSchema = new Schema<INewPatient>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    patientIdMrn: {
      type: String,
      required: [true, 'Patient MRN is required'],
      unique: true,
      trim: true,
    },
    dateOfBirth: {
      type: String,
      required: [true, 'Date of birth is required'],
    },
    age: { type: Number },
    gender: {
      type: String,
      enum: Object.values(Gender),
      required: [true, 'Gender is required'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    medicationAllergies: {
      type: String,
      required: [true, 'Medication allergies field is required'],
      trim: true,
    },
    admissionDate: {
      type: String,
      required: [true, 'Admission date is required'],
    },
    notes: { type: String },
  },
  { timestamps: true },
);

// Compound index if needed
// patientSchema.index({ ... });

const Patient = model<INewPatient>('Patient', patientSchema);

export default Patient;

import { Schema, model } from 'mongoose';
import {
  IMedication,
  MedicationRoute,
  MedicationFrequency,
} from './medication.interface';

const medicationSchema = new Schema<IMedication>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      // required: [true, 'Patient ID is required'],
    },

    medicationName: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true,
    },
    strength: {
      type: String,
      required: [true, 'Strength is required'],
      trim: true,
    },
    form: {
      type: String,
      required: [true, 'Form is required'],
      trim: true,
    },
    dose: {
      type: String,
      required: [true, 'Dose is required'],
    },
    route: {
      type: String,
      enum: Object.values(MedicationRoute),
      required: [true, 'Route is required'],
    },
    frequency: {
      type: String,
      enum: Object.values(MedicationFrequency),
      required: [true, 'Frequency is required'],
    },
    source: {
      type: String,
      enum: ['manual', 'ocr'],
      required: [true, 'Source is required'],
      default: 'manual',
    },
    duration: { type: String },
    additionalInstructions: { type: String },
  },
  { timestamps: true },
);

// Compound index for fast sessionId + patient queries
medicationSchema.index({ sessionId: 1, patientId: 1 });

const Medication = model<IMedication>('Medication', medicationSchema);

export default Medication;

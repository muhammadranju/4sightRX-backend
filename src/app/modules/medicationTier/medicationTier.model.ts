import { Schema, model } from 'mongoose';
import { IMedicationTier } from './medicationTier.interface';

const MedicationTierSchema = new Schema<IMedicationTier>(
  {
    tier: {
      type: String,
      required: true,
      trim: true,
    },
    medication: {
      type: String,
      required: true,
      trim: true,
    },
    brandName: {
      type: String,
      trim: true,
    },
    strength: {
      type: String,
      required: true,
      trim: true,
    },
    route: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
    },
    monthlyCost: {
      type: Number,
      required: true,
      min: 0,
    },
    alternativeMonthlyCost: {
      type: Number,
      required: true,
      min: 0,
    },
    preferredAlternative: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

MedicationTierSchema.index({ medication: 1, brandName: 1 });
MedicationTierSchema.index({ medication: 'text', brandName: 'text' });

export const MedicationTier = model<IMedicationTier>(
  'MedicationTier',
  MedicationTierSchema,
);

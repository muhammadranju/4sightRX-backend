import { Schema, model } from 'mongoose';
import { ITherapeutic } from './therapeutic.interface';

const therapeuticSchema = new Schema<ITherapeutic>(
  {
    // Stored lowercase for case-insensitive matching in queries
    drugName: {
      type: String,
      required: [true, 'Drug name is required'],
      trim: true,
      set: (v: string) => v.toLowerCase(),
    },
    alternative: {
      type: String,
      required: [true, 'Alternative drug name is required'],
      trim: true,
    },
    drugClass: {
      type: String,
      required: [true, 'Drug class is required'],
      trim: true,
    },
    dosageEquivalence: {
      type: String,
      required: [true, 'Dosage equivalence is required'],
      trim: true,
    },

    rationale: {
      type: String,
      required: [true, 'Rationale is required'],
      trim: true,
    },
    estimatedSavings: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

// Fast lookup by drug name (case-insensitive via lowercase setter)
therapeuticSchema.index({ drugName: 1 });

const Therapeutic = model<ITherapeutic>('Therapeutic', therapeuticSchema);

export default Therapeutic;

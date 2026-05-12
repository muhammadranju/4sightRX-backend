import { Schema, model } from 'mongoose';
import { IFormularyInterchange } from './formularyComparison.interface';

const formularyComparisonSchema = new Schema<IFormularyInterchange>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    currentMedication: {
      type: String,
      required: [true, 'Current medication name is required'],
      trim: true,
    },

    alternativeDrug: {
      type: String,
      required: [true, 'Alternative drug is required'],
      trim: true,
    },
    rationale: {
      type: String,
      required: [true, 'Rationale is required'],
    },
    estimatedSavings: {
      type: Number,
      required: [true, 'Estimated savings is required'],
      default: 0,
      min: 0,
    },
    dosageEquivalence: {
      type: String,
      required: [true, 'Dosage equivalence is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const FormularyInterchange = model<IFormularyInterchange>(
  'FormularyInterchange',
  formularyComparisonSchema,
);

export default FormularyInterchange;

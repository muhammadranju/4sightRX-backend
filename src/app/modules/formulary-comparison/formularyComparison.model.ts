import { Schema, model } from 'mongoose';
import { IFormularyComparison } from './formularyComparison.interface';

const formularyComparisonSchema = new Schema<IFormularyComparison>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID is required'],
    },

    medicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Medication',
      required: [true, 'Medication ID is required'],
    },
    currentMedication: {
      type: String,
      required: [true, 'Current medication name is required'],
      trim: true,
    },
    recommendedMedication: {
      type: String,
      required: [true, 'Recommended medication is required'],
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
    hospiceCovered: {
      type: Boolean,
      required: [true, 'Hospice covered flag is required'],
      default: false,
    },
    action: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'discontinued'],
      default: 'accepted',
    },
    sessionId: {
      type: String,
      index: true,
    },
    reasonNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const FormularyComparison = model<IFormularyComparison>(
  'FormularyComparison',
  formularyComparisonSchema,
);

export default FormularyComparison;

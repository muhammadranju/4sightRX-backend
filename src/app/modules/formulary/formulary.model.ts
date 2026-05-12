import { Schema, model } from 'mongoose';
import { IFormularyDrug, FormularyDrugModel } from './formulary.interface';

const formularyDrugSchema = new Schema<IFormularyDrug, FormularyDrugModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    allowedAlternatives: [
      {
        type: String,
      },
    ],
    cost: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const FormularyDrug = model<IFormularyDrug, FormularyDrugModel>(
  'FormularyDrug',
  formularyDrugSchema,
);

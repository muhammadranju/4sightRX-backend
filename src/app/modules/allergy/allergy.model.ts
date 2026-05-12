import { Schema, model } from 'mongoose';
import { IAllergy, AllergyModel } from './allergy.interface';

const allergySchema = new Schema<IAllergy, AllergyModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['medication', 'other'],
      default: 'medication',
    },
    aliases: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Allergy = model<IAllergy, AllergyModel>('Allergy', allergySchema);

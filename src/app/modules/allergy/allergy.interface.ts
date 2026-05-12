/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Model } from 'mongoose';

export type IAllergy = {
  name: string;
  type: 'medication' | 'other';
  aliases?: string[];
};

export type AllergyModel = Model<IAllergy>;

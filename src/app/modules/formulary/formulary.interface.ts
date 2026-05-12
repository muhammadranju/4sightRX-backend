/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Model } from 'mongoose';

export type IFormularyDrug = {
  name: string;
  allowedAlternatives: string[];
  cost: number;
  category: string;
};

export type FormularyDrugModel = Model<IFormularyDrug>;

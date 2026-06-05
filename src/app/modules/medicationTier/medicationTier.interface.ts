import { Document } from 'mongoose';

export interface IMedicationTier extends Document {
  tier: string;
  medication: string;
  brandName?: string;
  strength: string;
  route: string;
  frequency: string;
  monthlyCost: number;
  alternativeMonthlyCost: number;
  preferredAlternative?: string;
}

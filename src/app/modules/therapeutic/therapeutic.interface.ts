import { Types } from 'mongoose';

export interface ITherapeutic {
  agencyId?: Types.ObjectId; // Optional for backward compatibility with global formulary
  drugName: string; // The drug to look up (stored lowercase)
  alternative: string; // The suggested alternative drug name
  drugClass: string; // e.g., "Beta Blocker", "ACE Inhibitor"
  dosageEquivalence: string; // e.g., "10mg Lisinopril = 5mg Enalapril"
  rationale: string; // Why this switch is recommended
  estimatedSavings?: number; // Monthly USD savings from switching
  createdAt?: Date;
  updatedAt?: Date;
}

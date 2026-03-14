import { Types } from 'mongoose';

export type FormularyAction =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'discontinued';

export interface IFormularyComparison {
  patientId: Types.ObjectId;
  medicationId: Types.ObjectId;

  // Session UUID — groups all comparisons from one reconciliation session

  // The patient's current medication name (denormalized for easy display)
  currentMedication: string;

  // AI-recommended medication (may be same as current — "Continue Current Therapy")
  recommendedMedication: string;

  // Clinical rationale from Gemini AI
  rationale: string;

  // Estimated monthly savings in USD from the switch
  estimatedSavings: number;

  // Whether the recommended medication is covered under hospice care
  hospiceCovered: boolean;

  // Clinician's decision on the recommendation
  action: FormularyAction;

  // Detailed reasons for the decision (Phase 4)
  reasonNote?: string;
}

export interface IFormularyInterchange {
  currentMedication: string;
  alternativeDrug: string;
  rationale: string;
  estimatedSavings: number;
  dosageEquivalence: string;
}

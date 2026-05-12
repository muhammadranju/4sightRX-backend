import { Types } from 'mongoose';

export type FormularyAction =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'discontinued';

export interface IFormularyComparison {
  organizationId: Types.ObjectId;
  patientId: Types.ObjectId;
  medicationId: Types.ObjectId;
  currentMedication: string;
  recommendedMedication: string;
  rationale: string;
  estimatedSavings: number;
  hospiceCovered: boolean;
  action: FormularyAction;
  sessionId?: string;
  reasonNote?: string;
  createdAt: Date;
}

export interface IFormularyInterchange {
  organizationId: Types.ObjectId;
  currentMedication: string;
  alternativeDrug: string;
  rationale: string;
  estimatedSavings: number;
  dosageEquivalence: string;
}

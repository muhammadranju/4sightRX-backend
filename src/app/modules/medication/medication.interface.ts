/* eslint-disable no-unused-vars */
import { Types } from 'mongoose';

export enum MedicationRoute {
  ORAL = 'Oral (PO)',
  SUBLINGUAL = 'Sublingual (SL)',
  INTRAVENOUS = 'Intravenous (IV)',
  INTRAMUSCULAR = 'Intramuscular (IM)',
  SUBCUTANEOUS = 'Subcutaneous (SC)',
  TOPICAL = 'Topical',
  INHALED = 'Inhaled',
  RECTAL = 'Rectal (PR)',
}

export enum MedicationFrequency {
  ONCE_DAILY = 'Once daily (QD)',
  TWICE_DAILY = 'Twice daily (BID)',
  THREE_TIMES_DAILY = 'Three times daily (TID)',
  FOUR_TIMES_DAILY = '4 Times daily (QID)',
  EVERY_4_HOURS = 'Every 4 hours (Q4H)',
  EVERY_6_HOURS = 'Every 6 hours (Q6H)',
  EVERY_8_HOURS = 'Every 8 hours (Q8H)',
  EVERY_12_HOURS = 'Every 12 hours (Q12H)',
  AS_NEEDED = 'As needed (PRN)',
  ONCE_WEEKLY = 'Once weekly',
}

export type MedicationSource = 'manual' | 'ocr' | 'pdf';

export interface IMedication {
  organizationId: Types.ObjectId;
  patientId: Types.ObjectId;
  sessionId: string;
  medicationName: string;
  strength: string;
  form: string;
  dose: string;
  route: string; // Use string to allow flexible input from OCR
  frequency: string; // Use string to allow flexible input from OCR
  source: MedicationSource;
  duration?: string;
  additionalInstructions?: string;
  status: 'pending' | 'extracted' | 'verified';
}

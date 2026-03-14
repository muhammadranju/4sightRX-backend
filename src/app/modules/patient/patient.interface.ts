import { PartialStatus } from '../../../enums/user';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHERS = "Other's",
}

export interface INewPatient {
  // Personal Information Section
  firstName: string;
  lastName: string;
  mrn_id?: string;
  patientIdMrn: string;
  dateOfBirth: string; // Typically handled as ISO string (YYYY-MM-DD)
  age?: number; // Optional as it lacks a red asterisk
  gender: Gender;
  phoneNumber: string;
  medicationAllergies: string;
  status: PartialStatus;

  // Admission Information Section
  admissionDate: string;
  notes?: string;
}

/* eslint-disable no-unused-vars */
import { Types } from 'mongoose';
import { PartialStatus } from '../../../enums/user';

export enum Sex {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum LifeExpectancy {
  SIX_DAYS = '0-6 days',
  FOUR_WEEKS = '1-4 weeks',
  THREE_MONTHS = '1-3 months',
  SIX_MONTHS = '4-6 months',
  GREATER_THAN_SIX_MONTHS = '>6 months',
}

export interface INewPatient {
  organizationId: Types.ObjectId;
  firstName: string;
  lastName: string;
  patientIdMrn?: string;
  dob: Date;
  age?: number;
  sex: Sex;
  medicationAllergies: any;
  allergies: {
    medicationId: Types.ObjectId;
    reaction: string;
  }[];
  status: PartialStatus;
  admissionDate: Date;
  lifeExpectancy: LifeExpectancy;
  notes?: string;
  patientUploads?: { url: string; type: string; uploadedAt: Date }[];
}

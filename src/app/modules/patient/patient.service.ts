import { StatusCodes } from 'http-status-codes';
import random from 'random-string-generator';
import ApiError from '../../../errors/ApiError';
import { getAgeInYears } from '../../../helpers/getAgeInYears';
import { INewPatient } from './patient.interface';
import Patient from './patient.model';
import Medication from '../medication/medication.model';

// ─── Create ───────────────────────────────────────────────────────────────────

export const createPatientService = async (
  payload: INewPatient,
): Promise<INewPatient> => {
  const { dob } = payload;
  const age = getAgeInYears(dob as unknown as string);
  payload.age = age;
  if (!payload.patientIdMrn) {
    payload.patientIdMrn = `MRN-${random(5, 'numeric')}`;
  }
  const patient = new Patient(payload);
  return patient.save() as unknown as INewPatient;
};

// ─── Get All (with optional organization filter + pagination) ────────────────────

export const getAllPatientsService = async (
  page = 1,
  limit = 10,
  searchTerm?: string,
  organizationId?: string,
) => {
  const filter: any = {};

  if (organizationId) {
    filter.organizationId = organizationId;
  }

  if (searchTerm) {
    const searchableFields = [
      'firstName',
      'lastName',
      'patientIdMrn',
    ];
    filter.$or = searchableFields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' },
    }));
  }

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Patient.countDocuments(filter),
  ]);
  return { data: data as unknown as INewPatient[], total, page, limit };
};

// ─── Get Single ───────────────────────────────────────────────────────────────

export const getPatientByIdService = async (id: string, organizationId?: string) => {
  const query: any = { _id: id };
  if (organizationId) {
    query.organizationId = organizationId;
  }
  const patient = await Patient.findOne(query).lean();
  if (!patient) throw new ApiError(StatusCodes.NOT_FOUND, 'Patient not found');
  const findMedication = await Medication.find({
    patientId: id,
  }).countDocuments();
  return { ...patient, medicationCount: findMedication };
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updatePatientService = async (
  id: string,
  payload: Partial<INewPatient>,
  organizationId?: string,
): Promise<INewPatient> => {
  const { dob } = payload;
  if (dob) {
    payload.age = getAgeInYears(dob as unknown as string);
  }
  const query: any = { _id: id };
  if (organizationId) {
    query.organizationId = organizationId;
  }
  const patient = await Patient.findOneAndUpdate(
    query,
    { $set: payload },
    { new: true, runValidators: true },
  ).lean();
  if (!patient) throw new ApiError(StatusCodes.NOT_FOUND, 'Patient not found');
  return patient as unknown as INewPatient;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deletePatientService = async (id: string, organizationId?: string): Promise<void> => {
  const query: any = { _id: id };
  if (organizationId) {
    query.organizationId = organizationId;
  }
  const result = await Patient.findOneAndDelete(query);
  if (!result) throw new ApiError(StatusCodes.NOT_FOUND, 'Patient not found');
};

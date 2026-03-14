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
  const { dateOfBirth } = payload;
  const age = getAgeInYears(dateOfBirth);
  payload.age = age;
  payload.patientIdMrn = `MRN-${random(5, 'numeric')}`;
  const patient = new Patient(payload);
  return patient.save() as unknown as INewPatient;
};

// ─── Get All (with optional facility filter + pagination) ────────────────────

export const getAllPatientsService = async (page = 1, limit = 10) => {
  const filter: Record<string, unknown> = {};

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Patient.countDocuments(filter),
  ]);
  return { data: data as unknown as INewPatient[], total, page, limit };
};

// ─── Get Single ───────────────────────────────────────────────────────────────

export const getPatientByIdService = async (id: string) => {
  const patient = await Patient.findById(id).lean();
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
): Promise<INewPatient> => {
  const { dateOfBirth } = payload;
  if (dateOfBirth) {
    payload.age = getAgeInYears(dateOfBirth as string);
  }
  const patient = await Patient.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true },
  ).lean();
  if (!patient) throw new ApiError(StatusCodes.NOT_FOUND, 'Patient not found');
  return patient as unknown as INewPatient;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deletePatientService = async (id: string): Promise<void> => {
  const result = await Patient.findByIdAndDelete(id);
  if (!result) throw new ApiError(StatusCodes.NOT_FOUND, 'Patient not found');
};

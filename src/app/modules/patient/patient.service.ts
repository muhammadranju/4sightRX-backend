import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import Patient from './patient.model';
import { INewPatient } from './patient.interface';
import { getAgeInYears } from '../../../helpers/getAgeInYears';

// ─── Create ───────────────────────────────────────────────────────────────────

export const createPatientService = async (
  payload: INewPatient,
): Promise<INewPatient> => {
  const { dateOfBirth } = payload;
  const age = getAgeInYears(dateOfBirth);
  payload.age = age;
  const patient = new Patient(payload);
  return patient.save() as unknown as INewPatient;
};

// ─── Get All (with optional facility filter + pagination) ────────────────────

export const getAllPatientsService = async (
  facilityId?: string,
  page = 1,
  limit = 10,
): Promise<{
  data: INewPatient[];
  total: number;
  page: number;
  limit: number;
}> => {
  const filter: Record<string, unknown> = {};
  if (facilityId) filter.facility = facilityId;

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Patient.countDocuments(filter),
  ]);
  return { data: data as unknown as INewPatient[], total, page, limit };
};

// ─── Get Single ───────────────────────────────────────────────────────────────

export const getPatientByIdService = async (
  id: string,
): Promise<INewPatient> => {
  const patient = await Patient.findById(id).lean();
  if (!patient) throw new ApiError(StatusCodes.NOT_FOUND, 'Patient not found');
  return patient as unknown as INewPatient;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updatePatientService = async (
  id: string,
  payload: Partial<INewPatient>,
): Promise<INewPatient> => {
  const { dateOfBirth } = payload;
  const age = getAgeInYears(dateOfBirth as string);
  payload.age = age;
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

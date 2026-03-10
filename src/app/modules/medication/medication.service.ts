import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import Patient from '../patient/patient.model';
import { IMedication } from './medication.interface';
import Medication from './medication.model';

// ─── Bulk Insert ──────────────────────────────────────────────────────────────

export const createMedicationService = async (
  medication: IMedication,
): Promise<IMedication> => {
  const created = await Medication.create(medication);
  return created as unknown as IMedication;
};

export const bulkCreateMedicationsService = async (
  medications: IMedication[],
): Promise<IMedication[]> => {
  if (!medications || medications.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'At least one medication is required',
    );
  }

  // Validate that all patientIds are valid and patient exists
  const patientIds = [...new Set(medications.map(m => m.patientId.toString()))];
  for (const id of patientIds) {
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid patient ID: ${id}`);
    }
    const exists = await Patient.exists({ _id: id });
    if (!exists)
      throw new ApiError(StatusCodes.NOT_FOUND, `Patient not found: ${id}`);
  }

  const created = await Medication.insertMany(medications);
  return created as unknown as IMedication[];
};

// ─── Get by Session ───────────────────────────────────────────────────────────

export const getMedicationsService = async (
  limit: number,
  page: number,
  search: string,
): Promise<{
  data: IMedication[];
  total: number;
  page: number;
  limit: number;
}> => {
  const query: any = {};
  if (search) {
    query.medicationName = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Medication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Medication.countDocuments(query),
  ]);
  return {
    data: data as unknown as IMedication[],
    total,
    page,
    limit,
  };
};

// ─── Get by Patient ───────────────────────────────────────────────────────────

export const getMedicationByIdService = async (
  id: string,
): Promise<{
  data: IMedication[];
}> => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid medication ID');
  }
  const data = await Medication.findById(id).sort({ createdAt: -1 }).lean();
  return { data: data as unknown as IMedication[] };
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateMedicationService = async (
  id: string,
  payload: Partial<IMedication>,
): Promise<IMedication> => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid medication ID');
  }
  const med = await Medication.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true },
  ).lean();
  if (!med) throw new ApiError(StatusCodes.NOT_FOUND, 'Medication not found');
  return med as unknown as IMedication;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteMedicationService = async (id: string): Promise<void> => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid medication ID');
  }
  const result = await Medication.findByIdAndDelete(id);
  if (!result)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Medication not found');
};

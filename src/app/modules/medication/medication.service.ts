import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { IMedication } from './medication.interface';
import Medication from './medication.model';

// ─── Bulk Insert ──────────────────────────────────────────────────────────────

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

  const created = await Medication.insertMany(medications);
  return created as unknown as IMedication[];
};

// ─── Get All ───────────────────────────────────────────────────────────

export const getMedicationsService = async (
  limit: number,
  page: number,
  search: string,
  organizationId?: string,
): Promise<{
  data: IMedication[];
  total: number;
  page: number;
  limit: number;
}> => {
  const query: any = {};
  if (organizationId) {
    query.organizationId = organizationId;
  }
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

// ─── Get by ID ───────────────────────────────────────────────────────────

export const getMedicationByIdService = async (
  id: string,
  organizationId?: string,
): Promise<{
  data: IMedication;
}> => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid medication ID');
  }
  const query: any = { _id: id };
  if (organizationId) {
    query.organizationId = organizationId;
  }
  const data = await Medication.findOne(query).lean();
  if (!data) throw new ApiError(StatusCodes.NOT_FOUND, 'Medication not found');
  return { data: data as unknown as IMedication };
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateMedicationService = async (
  id: string,
  payload: Partial<IMedication>,
  organizationId?: string,
): Promise<IMedication> => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid medication ID');
  }
  const query: any = { _id: id };
  if (organizationId) {
    query.organizationId = organizationId;
  }
  const med = await Medication.findOneAndUpdate(
    query,
    { $set: payload },
    { new: true, runValidators: true },
  ).lean();
  if (!med) throw new ApiError(StatusCodes.NOT_FOUND, 'Medication not found');
  return med as unknown as IMedication;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteMedicationService = async (id: string, organizationId?: string): Promise<void> => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid medication ID');
  }
  const query: any = { _id: id };
  if (organizationId) {
    query.organizationId = organizationId;
  }
  const result = await Medication.findOneAndDelete(query);
  if (!result)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Medication not found');
};

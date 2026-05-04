import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import Therapeutic from './therapeutic.model';
import { ITherapeutic } from './therapeutic.interface';

// ─── Create ───────────────────────────────────────────────────────────────────

export const createTherapeuticService = async (
  payload: ITherapeutic,
): Promise<ITherapeutic> => {
  const doc = new Therapeutic(payload);
  return doc.save() as unknown as ITherapeutic;
};

// ─── Get All (with pagination) ────────────────────────────────────────────────

export const getAllTherapeuticsService = async (
  page = 1,
  limit = 10,
  agencyId?: string,
): Promise<{
  data: ITherapeutic[];
  total: number;
  page: number;
  limit: number;
}> => {
  const filter: any = {};
  if (agencyId) {
    filter.agencyId = agencyId;
  }
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Therapeutic.find(filter)
      .populate('agencyId')
      .sort({ drugName: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Therapeutic.countDocuments(filter),
  ]);
  return { data: data as unknown as ITherapeutic[], total, page, limit };
};

// ─── Get by Drug Name (case-insensitive) ─────────────────────────────────────

export const getTherapeuticByDrugNameService = async (
  drugName: string,
  agencyId?: string,
): Promise<ITherapeutic> => {
  const query: any = { drugName: drugName.toLowerCase() };
  if (agencyId) {
    query.agencyId = agencyId;
  }
  const doc = await Therapeutic.findOne(query).lean();
  if (!doc)
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `No therapeutic found for drug: ${drugName}`,
    );
  return doc as unknown as ITherapeutic;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateTherapeuticService = async (
  id: string,
  payload: Partial<ITherapeutic>,
): Promise<ITherapeutic> => {
  const doc = await Therapeutic.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true },
  ).lean();
  if (!doc)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Therapeutic record not found');
  return doc as unknown as ITherapeutic;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteTherapeuticService = async (id: string): Promise<void> => {
  const result = await Therapeutic.findByIdAndDelete(id);
  if (!result)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Therapeutic record not found');
};

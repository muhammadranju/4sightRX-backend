import { IFacility } from './facility.interface';
import { Facility } from './facility.model';

const createFacilityToDB = async (payload: IFacility) => {
  const result = await Facility.create(payload);
  return result;
};

const getAllFacilitiesFromDB = async (
  page = 1,
  limit = 10,
  search?: string,
) => {
  const filter: any = {};

  if (search) {
    const searchableFields = ['facilityName', 'location', 'address'];
    filter.$or = searchableFields.map(field => ({
      [field]: { $regex: search, $options: 'i' },
    }));
  }

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Facility.find(filter)
      .populate('assignAdmin')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Facility.countDocuments(filter),
  ]);
  return { data, total, page, limit };
};

const updateFacilityToDB = async (id: string, payload: IFacility) => {
  const result = await Facility.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteFacilityToDB = async (id: string) => {
  const result = await Facility.findByIdAndDelete(id);
  return result;
};

export const FacilityService = {
  createFacilityToDB,
  getAllFacilitiesFromDB,
  updateFacilityToDB,
  deleteFacilityToDB,
};

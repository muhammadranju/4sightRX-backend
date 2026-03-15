import { IFacility } from './facility.interface';
import { Facility } from './facility.model';

const createFacilityToDB = async (payload: IFacility) => {
  const result = await Facility.create(payload);
  return result;
};

const getAllFacilitiesFromDB = async () => {
  const result = await Facility.find()
    .populate('assignAdmin')
    .sort({ createdAt: -1 });
  return result;
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

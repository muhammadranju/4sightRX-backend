import { Allergy } from './allergy.model';

const getAllAllergies = async (search: string) => {
  const query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { aliases: { $regex: search, $options: 'i' } },
    ];
  }
  const result = await Allergy.find(query).limit(10);
  return result;
};

const createAllergy = async (payload: any) => {
  const result = await Allergy.create(payload);
  return result;
};

const updateAllergy = async (id: string, payload: any) => {
  const result = await Allergy.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteAllergy = async (id: string) => {
  const result = await Allergy.findByIdAndDelete(id);
  return result;
};

const getActiveAllergies = async (search: string) => {
  const query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { aliases: { $regex: search, $options: 'i' } },
    ];
  }
  const result = await Allergy.find(query).limit(10);
  return result;
};

export const AllergyService = {
  getAllAllergies,
  createAllergy,
  updateAllergy,
  deleteAllergy,
  getActiveAllergies,
};

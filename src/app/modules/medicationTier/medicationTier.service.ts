import { IMedicationTier } from './medicationTier.interface';
import { MedicationTier } from './medicationTier.model';

const createMedicationTier = async (medicationTier: IMedicationTier) => {
  return await MedicationTier.create(medicationTier);
};

/**
 * Accepts an array of medication tier records and inserts them all at once.
 * Used by the frontend dashboard when saving the full imported dataset.
 */
const bulkCreateMedicationTiers = async (
  medicationTiers: Partial<IMedicationTier>[],
) => {
  return await MedicationTier.insertMany(medicationTiers);
};

const getAllMedicationTiers = async () => {
  return await MedicationTier.find();
};

const getMedicationTierById = async (id: string) => {
  return await MedicationTier.findById(id);
};

const updateMedicationTier = async (
  id: string,
  medicationTier: IMedicationTier,
) => {
  return await MedicationTier.findByIdAndUpdate(id, medicationTier, {
    new: true,
    runValidators: true,
  });
};

const deleteMedicationTier = async (id: string) => {
  return await MedicationTier.findByIdAndDelete(id);
};

export const MedicationTierService = {
  createMedicationTier,
  bulkCreateMedicationTiers,
  getAllMedicationTiers,
  getMedicationTierById,
  updateMedicationTier,
  deleteMedicationTier,
};

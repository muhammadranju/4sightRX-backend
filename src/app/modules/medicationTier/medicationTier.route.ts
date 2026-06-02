import { Router } from 'express';
import { MedicationTierController } from './medicationTier.controller';

const router = Router();

router.post('/', MedicationTierController.createMedicationTier);
router.get('/', MedicationTierController.getAllMedicationTiers);
router.get('/:id', MedicationTierController.getMedicationTierById);
router.patch('/:id', MedicationTierController.updateMedicationTier);
router.delete('/:id', MedicationTierController.deleteMedicationTier);

export const MedicationTierRoutes = router;

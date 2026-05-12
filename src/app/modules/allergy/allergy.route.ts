import express from 'express';
import { AllergyController } from './allergy.controller';

const router = express.Router();

router.get('/', AllergyController.getAllAllergies);
router.get('/search', AllergyController.getActiveAllergies);
router.post('/', AllergyController.createAllergy);
router.patch('/:id', AllergyController.updateAllergy);
router.delete('/:id', AllergyController.deleteAllergy);

export const AllergyRoutes = router;

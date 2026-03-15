import express from 'express';
import { FacilityController } from './facility.controller';

const router = express.Router();

router.post('/', FacilityController.createFacility);
router.route('/').get(FacilityController.getAllFacilities);
router.route('/:id').patch(FacilityController.updateFacility);
router.route('/:id').delete(FacilityController.deleteFacility);

export const FacilityRoute = router;

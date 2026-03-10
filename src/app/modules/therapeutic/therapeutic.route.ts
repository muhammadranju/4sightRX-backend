import express from 'express';
import { TherapeuticController } from './therapeutic.controller';

const router = express.Router();

router.post('/', TherapeuticController.createTherapeutic);
router.get('/', TherapeuticController.getAllTherapeutics);
// Named param route BEFORE /:id to avoid conflict
router.get('/drug/:drugName', TherapeuticController.getByDrugName);
router.patch('/:id', TherapeuticController.updateTherapeutic);
router.delete('/:id', TherapeuticController.deleteTherapeutic);

const therapeuticRoutes = router;

export default therapeuticRoutes;

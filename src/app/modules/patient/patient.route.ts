import express from 'express';
import { PatientController } from './patient.controller';

const router = express.Router();

router.post('/', PatientController.createPatient);
router.get('/', PatientController.getAllPatients); // ?facilityId=xxx&page=1&limit=10
router.get('/:id', PatientController.getPatientById);
router.patch('/:id', PatientController.updatePatient);
router.delete('/:id', PatientController.deletePatient);

const patientRoutes = router;

export default patientRoutes;

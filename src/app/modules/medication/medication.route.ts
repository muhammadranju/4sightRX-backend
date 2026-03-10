import express from 'express';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { MedicationController } from './medication.controller';
import { OcrController } from './ocr.controller';

const router = express.Router();

router.post(
  '/extract-text',
  fileUploadHandler(),
  OcrController.extractMedications,
); // POST /medications/extract-text

router.post('/', MedicationController.createMedication); // POST /medications

router.post('/bulk', MedicationController.bulkCreate); // POST /medications/bulk
router.get('/', MedicationController.getMedications); // GET  /medications?sessionId=xxx
router.get('/:id', MedicationController.getMedicationById); // GET  /medications/patient/:patientId
router.patch('/:id', MedicationController.updateMedication); // PATCH /medications/:id
router.delete('/:id', MedicationController.deleteMedication); // DELETE /medications/:id

const medicationRoutes = router;

export default medicationRoutes;

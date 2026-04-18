import express from 'express';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { MedicationController } from './medication.controller';
import { OcrController } from './ocr.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/extract-text',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  fileUploadHandler(),
  OcrController.extractMedications,
); // POST /medications/extract-text

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MedicationController.createMedication,
); // POST /medications

router.post(
  '/bulk',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MedicationController.bulkCreate,
); // POST /medications/bulk
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MedicationController.getMedications,
); // GET  /medications?sessionId=xxx
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MedicationController.getMedicationById,
); // GET  /medications/patient/:patientId
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MedicationController.updateMedication,
); // PATCH /medications/:id
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MedicationController.deleteMedication,
); // DELETE /medications/:id

const medicationRoutes = router;

export default medicationRoutes;

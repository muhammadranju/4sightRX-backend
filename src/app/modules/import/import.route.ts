import { Router } from 'express';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { ImportController } from './import.controller';

const router = Router();

router.post(
  '/trial',
  fileUploadHandler(),
  ImportController.importTrialData
);

export const ImportRoutes = router;

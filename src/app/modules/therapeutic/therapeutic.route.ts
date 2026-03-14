import express from 'express';
import { TherapeuticController } from './therapeutic.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  TherapeuticController.createTherapeutic,
);
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  TherapeuticController.getAllTherapeutics,
);
// Named param route BEFORE /:id to avoid conflict
router.get(
  '/drug/:drugName',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  TherapeuticController.getByDrugName,
);
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  TherapeuticController.updateTherapeutic,
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  TherapeuticController.deleteTherapeutic,
);

const therapeuticRoutes = router;

export default therapeuticRoutes;

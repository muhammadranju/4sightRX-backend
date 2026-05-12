import express from 'express';
import { FormularyController } from './formulary.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.get('/', auth(USER_ROLES.USER, USER_ROLES.ADMIN), FormularyController.getAllFormularyDrugs);
router.post('/', auth(USER_ROLES.ADMIN), FormularyController.createFormularyDrug);
router.get('/recommendations/:patientId', auth(USER_ROLES.USER, USER_ROLES.ADMIN), FormularyController.getRecommendations);

export const FormularyRoutes = router;

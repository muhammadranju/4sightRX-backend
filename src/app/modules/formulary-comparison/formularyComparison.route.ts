import express from 'express';
import { FormularyComparisonController } from './formularyComparison.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

/**
 * POST /formulary-comparison/analyze
 * Trigger AI-based formulary comparison for a batch of medications.
 */
router.post(
  '/analyze',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  FormularyComparisonController.analyzeFormulary,
);

/**
 * GET /formulary-comparison/summary
 * Fetch the final reconciliation summary grouped by action.
 */
router.get(
  '/summary',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  FormularyComparisonController.getSummary,
);

/**
 * PATCH /formulary-comparison/:id/action
 * Clinician accepts, declines, or discontinues a recommendation.
 */
router.patch(
  '/:id/action',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  FormularyComparisonController.updateAction,
);

// formulary interchange
router
  .route('/therapeutic-interchange')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    FormularyComparisonController.getFormularyInterchange,
  );

router
  .route('/therapeutic-interchange')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    FormularyComparisonController.createFormularyInterchange,
  );

router
  .route('/therapeutic-interchange/:id')
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    FormularyComparisonController.updateFormularyInterchange,
  );

const formularyComparisonRoutes = router;

export default formularyComparisonRoutes;

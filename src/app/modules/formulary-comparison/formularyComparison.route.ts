import express from 'express';
import { FormularyComparisonController } from './formularyComparison.controller';

const router = express.Router();

/**
 * POST /formulary-comparison/analyze
 * Trigger AI-based formulary comparison for a batch of medications.
 */
router.post('/analyze', FormularyComparisonController.analyzeFormulary);

/**
 * GET /formulary-comparison/summary
 * Fetch the final reconciliation summary grouped by action.
 */
router.get('/summary', FormularyComparisonController.getSummary);

/**
 * PATCH /formulary-comparison/:id/action
 * Clinician accepts, declines, or discontinues a recommendation.
 */
router.patch('/:id/action', FormularyComparisonController.updateAction);

// formulary interchange
router
  .route('/therapeutic-interchange')
  .get(FormularyComparisonController.getFormularyInterchange);

router
  .route('/therapeutic-interchange')
  .post(FormularyComparisonController.createFormularyInterchange);

router
  .route('/therapeutic-interchange/:id')
  .patch(FormularyComparisonController.updateFormularyInterchange);

const formularyComparisonRoutes = router;

export default formularyComparisonRoutes;

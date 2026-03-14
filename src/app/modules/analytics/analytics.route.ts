import express from 'express';
import { AnalyticsController } from './analytics.controller';
const router = express.Router();

router.get('/app/analytics', AnalyticsController.getAppAnalytics);
router.get('/dashboard/analytics', AnalyticsController.getDashboardAnalytics);
router.get('/monthly-saving-cost', AnalyticsController.getMonthlySavingCost);
router.get(
  '/acceptance-rate',
  AnalyticsController.getRecommendationAcceptanceRate,
);

router.get('/recent-activities', AnalyticsController.getRecentActivities);

const analyticsRoutes = router;

export default analyticsRoutes;

import express from 'express';
import { AnalyticsController } from './analytics.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();

router.get(
  '/app/analytics',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getAppAnalytics,
);
router.get(
  '/dashboard/analytics',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getDashboardAnalytics,
);
router.get(
  '/monthly-saving-cost',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getMonthlySavingCost,
);
router.get(
  '/monthly-savings',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getMonthlySavings,
);
router.get(
  '/recent-activities',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getRecentActivities,
);

const analyticsRoutes = router;

export default analyticsRoutes;

import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import patientRoutes from '../app/modules/patient/patient.route';
import medicationRoutes from '../app/modules/medication/medication.route';
import therapeuticRoutes from '../app/modules/therapeutic/therapeutic.route';
import formularyComparisonRoutes from '../app/modules/formulary-comparison/formularyComparison.route';
const router = express.Router();

const apiRoutes = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/patients', route: patientRoutes },
  { path: '/medications', route: medicationRoutes },
  { path: '/therapeutics', route: therapeuticRoutes },
  { path: '/formulary-comparison', route: formularyComparisonRoutes },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;

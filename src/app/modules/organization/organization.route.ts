import express from 'express';
import { OrganizationController } from './organization.controller';

const router = express.Router();

router.post('/', OrganizationController.createOrganization);
router.get('/', OrganizationController.getAllOrganizations);
router.get('/:id', OrganizationController.getOrganizationById);
router.patch('/:id', OrganizationController.updateOrganization);
router.delete('/:id', OrganizationController.deleteOrganization);

export const OrganizationRoutes = router;

import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.createLoginZodSchema),
  AuthController.loginUser
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.forgetPassword
);

router.post(
  '/verify-email',
  validateRequest(AuthValidation.createVerifyEmailZodSchema),
  AuthController.verifyEmail
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.createResetPasswordZodSchema),
  AuthController.resetPassword
);

router.post(
  '/change-password',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  validateRequest(AuthValidation.createChangePasswordZodSchema),
  AuthController.changePassword
);

router.post(
  '/fingerprint/options',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  validateRequest(AuthValidation.createFingerprintOptionsZodSchema),
  AuthController.getFingerprintSetupOptions
);

router.post(
  '/fingerprint/verify',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  validateRequest(AuthValidation.createFingerprintVerifyZodSchema),
  AuthController.verifyFingerprintSetup
);

export const AuthRoutes = router;

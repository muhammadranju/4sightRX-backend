/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
  firstName: string;
  lastName: string;
  role: USER_ROLES;
  email: string;
  password: string;
  organizationId: Types.ObjectId;
  image?: string;
  status: 'active' | 'blocked';
  verified: boolean;
  specialty: string;
  hospitalName: string;
  isLogin: boolean;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  webauthnChallenge?: string | null;
  webauthnCredential?: {
    credentialId: string;
    publicKey: string;
    counter: number;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;

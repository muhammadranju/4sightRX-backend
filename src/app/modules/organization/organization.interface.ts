/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Model } from 'mongoose';

export type IOrganization = {
  name: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  status: 'active' | 'inactive';
};

export type OrganizationModel = Model<IOrganization>;

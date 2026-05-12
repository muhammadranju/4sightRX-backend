import { Schema, model } from 'mongoose';
import { IOrganization, OrganizationModel } from './organization.interface';

const organizationSchema = new Schema<IOrganization, OrganizationModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    address: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

export const Organization = model<IOrganization, OrganizationModel>(
  'Organization',
  organizationSchema,
);

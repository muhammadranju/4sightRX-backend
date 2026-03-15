import { model, Schema } from 'mongoose';
import { IFacility } from './facility.interface';

const facilitySchema = new Schema<IFacility>(
  {
    facilityName: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    assignAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);

export const Facility = model<IFacility>('Facility', facilitySchema);

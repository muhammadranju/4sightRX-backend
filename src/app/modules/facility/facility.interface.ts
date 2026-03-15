import { Types } from 'mongoose';

export interface IFacility {
  facilityName: string;
  type: string;
  location: string;
  address: string;
  phone: string;
  assignAdmin: Types.ObjectId;
  status: string;
}

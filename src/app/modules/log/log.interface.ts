/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Model, Types } from 'mongoose';

export type ILog = {
  organizationId: Types.ObjectId;
  type: 'savings' | 'extraction' | 'recommendation';
  details: any;
  source?: string;
  confidence?: number;
};

export type LogModel = Model<ILog>;

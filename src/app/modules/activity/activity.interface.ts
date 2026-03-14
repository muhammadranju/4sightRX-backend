import { Model, Types } from 'mongoose';

export type IActivity = {
  user: Types.ObjectId;
  name: string;
  specialization: string;
  action: string;
  createdAt: Date;
  timeAgo: string;
};

export type ActivityModel = Model<IActivity, Record<string, never>>;

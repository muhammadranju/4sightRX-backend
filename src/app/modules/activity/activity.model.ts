import { model, Schema } from 'mongoose';
import { ActivityModel, IActivity } from './activity.interface';

const activitySchema = new Schema<IActivity, ActivityModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Activity = model<IActivity, ActivityModel>(
  'Activity',
  activitySchema,
);

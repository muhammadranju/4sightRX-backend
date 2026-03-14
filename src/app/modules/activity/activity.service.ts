import { IActivity } from './activity.interface';
import { Activity } from './activity.model';
import getRelativeTime from '../../../util/relativeTime';

const createActivity = async (payload: Partial<IActivity>) => {
  const result = await Activity.create(payload);
  return result;
};

const getAllActivities = async () => {
  const result = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(10);
  
  // Format timestamps to human-readable relative time
  const formattedResult = result.map(activity => {
    const activityObj = activity.toObject();
    return {
      ...activityObj,
      timeAgo: getRelativeTime(new Date(activityObj.timestamp)),
    };
  });

  return formattedResult;
};

export const ActivityService = {
  createActivity,
  getAllActivities,
};

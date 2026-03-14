import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ActivityService } from './activity.service';

const createActivity = catchAsync(async (req: Request, res: Response) => {
  const result = await ActivityService.createActivity(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Activity recorded successfully',
    data: result,
  });
});

const getAllActivities = catchAsync(async (req: Request, res: Response) => {
  const result = await ActivityService.getAllActivities();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Activities fetched successfully',
    data: result,
  });
});

export const ActivityController = {
  createActivity,
  getAllActivities,
};

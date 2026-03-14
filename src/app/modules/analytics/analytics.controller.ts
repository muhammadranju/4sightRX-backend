import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AnalyticsService } from './analytics.service';

const getAppAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getAppAnalyticsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'App analytics retrieved successfully',
    data: result,
  });
});

const getDashboardAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AnalyticsService.getDashboardAnalyticsFromDB();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Dashboard analytics retrieved successfully',
      data: result,
    });
  },
);

const getMonthlySavingCost = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getMonthlySavingCostFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Monthly saving cost retrieved successfully',
    data: result,
  });
});

const getRecommendationAcceptanceRate = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await AnalyticsService.getRecommendationAcceptanceRateFromDB();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Recommendation acceptance rate retrieved successfully',
      data: result,
    });
  },
);

const getRecentActivities = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getRecentActivitiesFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Recent activities retrieved successfully',
    data: result,
  });
});

export const AnalyticsController = {
  getAppAnalytics,
  getDashboardAnalytics,
  getMonthlySavingCost,
  getRecommendationAcceptanceRate,
  getRecentActivities,
};

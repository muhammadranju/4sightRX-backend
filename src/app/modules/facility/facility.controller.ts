import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FacilityService } from './facility.service';

const createFacility = catchAsync(async (req: Request, res: Response) => {
  const result = await FacilityService.createFacilityToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Facility created successfully.',
    data: result,
  });
});

const getAllFacilities = catchAsync(async (req: Request, res: Response) => {
  const result = await FacilityService.getAllFacilitiesFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Facilities fetched successfully.',
    data: result,
  });
});

const updateFacility = catchAsync(async (req: Request, res: Response) => {
  const result = await FacilityService.updateFacilityToDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Facility updated successfully.',
    data: result,
  });
});

const deleteFacility = catchAsync(async (req: Request, res: Response) => {
  const result = await FacilityService.deleteFacilityToDB(
    req.params.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Facility deleted successfully.',
    data: result,
  });
});

export const FacilityController = {
  getAllFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
};

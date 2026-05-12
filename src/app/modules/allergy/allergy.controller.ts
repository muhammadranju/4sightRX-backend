import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AllergyService } from './allergy.service';

const getAllAllergies = catchAsync(async (req: Request, res: Response) => {
  const { q } = req.query;
  const result = await AllergyService.getAllAllergies(q as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Allergies retrieved successfully',
    data: result,
  });
});

const createAllergy = catchAsync(async (req: Request, res: Response) => {
  const result = await AllergyService.createAllergy(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Allergy created successfully',
    data: result,
  });
});

const updateAllergy = catchAsync(async (req: Request, res: Response) => {
  const result = await AllergyService.updateAllergy(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Allergy updated successfully',
    data: result,
  });
});

const deleteAllergy = catchAsync(async (req: Request, res: Response) => {
  const result = await AllergyService.deleteAllergy(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Allergy deleted successfully',
    data: result,
  });
});

const getActiveAllergies = catchAsync(async (req: Request, res: Response) => {
  const { q } = req.query;
  const result = await AllergyService.getActiveAllergies(q as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Active allergies retrieved successfully',
    data: result,
  });
});

export const AllergyController = {
  getAllAllergies,
  createAllergy,
  updateAllergy,
  deleteAllergy,
  getActiveAllergies,
};

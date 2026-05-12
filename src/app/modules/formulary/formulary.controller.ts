import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FormularyService } from './formulary.service';

const createFormularyDrug = catchAsync(async (req: Request, res: Response) => {
  const result = await FormularyService.createFormularyDrug(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Formulary drug created successfully',
    data: result,
  });
});

const getAllFormularyDrugs = catchAsync(async (req: Request, res: Response) => {
  const result = await FormularyService.getAllFormularyDrugs();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Formulary drugs retrieved successfully',
    data: result,
  });
});

const getRecommendations = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await FormularyService.getRecommendationsForPatient(
    req.params.patientId as string,
    user.organizationId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Recommendations retrieved successfully',
    data: result,
  });
});

export const FormularyController = {
  createFormularyDrug,
  getAllFormularyDrugs,
  getRecommendations,
};

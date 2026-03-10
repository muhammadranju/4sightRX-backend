import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import {
  createTherapeuticService,
  deleteTherapeuticService,
  getAllTherapeuticsService,
  getTherapeuticByDrugNameService,
  updateTherapeuticService,
} from './therapeutic.service';

const createTherapeutic = catchAsync(async (req: Request, res: Response) => {
  const data = await createTherapeuticService(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Therapeutic alternative created',
    data,
  });
});

const getAllTherapeutics = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const result = await getAllTherapeuticsService(page, limit);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Therapeutics fetched',
    pagination: {
      page: result.page,
      limit: result.limit,
      totalPage: Math.ceil(result.total / result.limit),
      total: result.total,
    },
    data: result.data,
  });
});

const getByDrugName = catchAsync(async (req: Request, res: Response) => {
  const data = await getTherapeuticByDrugNameService(
    req.params.drugName as string,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Therapeutic fetched',
    data,
  });
});

const updateTherapeutic = catchAsync(async (req: Request, res: Response) => {
  const data = await updateTherapeuticService(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Therapeutic updated',
    data,
  });
});

const deleteTherapeutic = catchAsync(async (req: Request, res: Response) => {
  await deleteTherapeuticService(req.params.id as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Therapeutic deleted',
    data: null,
  });
});

export const TherapeuticController = {
  createTherapeutic,
  getAllTherapeutics,
  getByDrugName,
  updateTherapeutic,
  deleteTherapeutic,
};

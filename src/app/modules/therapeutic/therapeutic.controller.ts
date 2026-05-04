import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { USER_ROLES } from '../../../enums/user';
import {
  createTherapeuticService,
  deleteTherapeuticService,
  getAllTherapeuticsService,
  getTherapeuticByDrugNameService,
  updateTherapeuticService,
} from './therapeutic.service';

const createTherapeutic = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.agencyId && req.user.role !== USER_ROLES.SUPER_ADMIN) {
    data.agencyId = req.user.agencyId;
  }
  const result = await createTherapeuticService(data);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Therapeutic alternative created',
    data: result,
  });
});

const getAllTherapeutics = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  let agencyId = req.query.agencyId as string;
  if (req.user.role !== USER_ROLES.SUPER_ADMIN) {
    agencyId = req.user.agencyId;
  }

  const result = await getAllTherapeuticsService(page, limit, agencyId);
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
  let agencyId = req.query.agencyId as string;
  if (req.user.role !== USER_ROLES.SUPER_ADMIN) {
    agencyId = req.user.agencyId;
  }

  const data = await getTherapeuticByDrugNameService(
    req.params.drugName as string,
    agencyId,
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

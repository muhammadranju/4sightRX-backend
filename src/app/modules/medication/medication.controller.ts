import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import {
  bulkCreateMedicationsService,
  createMedicationService,
  deleteMedicationService,
  getMedicationByIdService,
  getMedicationsService,
  updateMedicationService,
} from './medication.service';

const bulkCreate = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const medications = req.body.medications.map((med: any) => ({
    ...med,
    organizationId: user.organizationId,
  }));
  const data = await bulkCreateMedicationsService(medications);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Medications created',
    data,
  });
});

const getMedications = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string;

  const result = await getMedicationsService(limit, page, search, user.organizationId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medications fetched',
    pagination: {
      page: result.page,
      limit: result.limit,
      totalPage: Math.ceil(result.total / result.limit),
      total: result.total,
    },
    data: result.data,
  });
});

const getMedicationById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await getMedicationByIdService(req.params.id as string, user.organizationId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medication fetched',
    data: result.data,
  });
});

const updateMedication = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const data = await updateMedicationService(req.params.id as string, req.body, user.organizationId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medication updated',
    data,
  });
});

const deleteMedication = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  await deleteMedicationService(req.params.id as string, user.organizationId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medication deleted',
    data: null,
  });
});

const createMedication = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const data = await createMedicationService({
    ...req.body,
    organizationId: user.organizationId,
  });
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Medication created',
    data,
  });
});

export const MedicationController = {
  bulkCreate,
  getMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
  createMedication,
};

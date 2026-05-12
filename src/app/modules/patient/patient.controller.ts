import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import {
  createPatientService,
  deletePatientService,
  getAllPatientsService,
  getPatientByIdService,
  updatePatientService,
} from './patient.service';

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const data = await createPatientService({
    ...req.body,
    organizationId: user.organizationId,
  });
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Patient created',
    data,
  });
});

const getAllPatients = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const searchTerm = req.query.search as string;
  const result = await getAllPatientsService(page, limit, searchTerm, user.organizationId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Patients fetched',
    pagination: {
      page: result.page,
      limit: result.limit,
      totalPage: Math.ceil(result.total / result.limit),
      total: result.total,
    },
    data: result.data,
  });
});

const getPatientById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const data = await getPatientByIdService(req.params.id as string, user.organizationId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Patient fetched',
    data,
  });
});

const updatePatient = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const data = await updatePatientService(req.params.id as string, req.body, user.organizationId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Patient updated',
    data,
  });
});

const deletePatient = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  await deletePatientService(req.params.id as string, user.organizationId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Patient deleted',
    data: null,
  });
});

export const PatientController = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};

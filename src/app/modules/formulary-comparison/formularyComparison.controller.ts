import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import {
  analyzeFormularyService,
  createFormularyInterchangeService,
  getFormularyInterchangeService,
  getSummaryService,
  updateActionService,
  updateFormularyInterchangeService,
} from './formularyComparison.service';
import { actionSchema, analyzeSchema } from './formularyComparison.validation';

const analyzeFormulary = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.body.patientId as string;
  // Zod validation
  const parsed = analyzeSchema.safeParse({ body: req.body, patientId });
  if (!parsed.success) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Validation failed',
      data: parsed.error.flatten().fieldErrors,
    });
  }

  const recommendations = await analyzeFormularyService(
    parsed.data.body,
    patientId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Formulary analysis complete',
    data: recommendations,
  });
});

const updateAction = catchAsync(async (req: Request, res: Response) => {
  const parsed = actionSchema.safeParse({ body: req.body, params: req.params });
  if (!parsed.success) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Validation failed',
      data: parsed.error.flatten().fieldErrors,
    });
  }

  const updated = await updateActionService(
    parsed.data.params.id,
    parsed.data.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Action updated successfully',
    data: updated,
  });
});

const getSummary = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.query.patientId as string;
  const summary = await getSummaryService(patientId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reconciliation summary fetched',
    data: summary,
  });
});

// formulary interchange

const getFormularyInterchange = catchAsync(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const summary = await getFormularyInterchangeService(page, limit, search);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reconciliation summary fetched',
      pagination: {
        page: summary.page,
        limit: summary.limit,
        totalPage: Math.ceil(summary.total / summary.limit),
        total: summary.total,
      },
      data: summary.data,
    });
  },
);

const createFormularyInterchange = catchAsync(
  async (req: Request, res: Response) => {
    const { ...data } = req.body;
    const summary = await createFormularyInterchangeService(data);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reconciliation summary fetched',
      data: summary,
    });
  },
);

const updateFormularyInterchange = catchAsync(
  async (req: Request, res: Response) => {
    const { ...data } = req.body;
    const id = req.params.id;
    const summary = await updateFormularyInterchangeService(id as string, data);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reconciliation summary fetched',
      data: summary,
    });
  },
);

export const FormularyComparisonController = {
  analyzeFormulary,
  updateAction,
  getSummary,
  getFormularyInterchange,
  createFormularyInterchange,
  updateFormularyInterchange,
};

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
  // Zod validation
  const parsed = analyzeSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Validation failed',
      data: parsed.error.flatten().fieldErrors,
    });
  }

  const recommendations = await analyzeFormularyService(parsed.data.body);

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
  const summary = await getSummaryService();

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
    const summary = await getFormularyInterchangeService();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reconciliation summary fetched',
      data: summary,
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

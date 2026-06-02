import { Request, Response } from 'express';

import { IMedicationTier } from './medicationTier.interface';
import { MedicationTierService } from './medicationTier.service';

import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';

const createMedicationTier = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;

  // Helper to remove database-generated fields in case frontend passes them back
  const sanitizePayload = (item: any) => {
    if (!item) return item;
    const { _id, createdAt, updatedAt, __v, ...rest } = item;
    return rest;
  };

  // Support both single object and array payloads
  if (Array.isArray(body)) {
    const sanitizedArray = body.map(sanitizePayload);
    const result = await MedicationTierService.bulkCreateMedicationTiers(sanitizedArray);
    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Medication Tier created successfully',
      data: result,
    });
  }

  const result = await MedicationTierService.createMedicationTier(sanitizePayload(body) as IMedicationTier);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Medication Tier created successfully',
    data: result,
  });
});

const getAllMedicationTiers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MedicationTierService.getAllMedicationTiers();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Medication Tiers fetched successfully',
      data: result,
    });
  },
);

const getMedicationTierById = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MedicationTierService.getMedicationTierById(
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Medication Tier fetched successfully',
      data: result,
    });
  },
);

const updateMedicationTier = catchAsync(async (req: Request, res: Response) => {
  const result = await MedicationTierService.updateMedicationTier(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medication Tier updated successfully',
    data: result,
  });
});

const deleteMedicationTier = catchAsync(async (req: Request, res: Response) => {
  const result = await MedicationTierService.deleteMedicationTier(
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Medication Tier deleted successfully',
    data: result,
  });
});

export const MedicationTierController = {
  createMedicationTier,
  getAllMedicationTiers,
  getMedicationTierById,
  updateMedicationTier,
  deleteMedicationTier,
};

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';
import { ImportService } from './import.service';

const importTrialData = catchAsync(async (req: Request, res: Response) => {
  // Use 'doc' or 'files' or 'files[]' fields from the fileUploadHandler
  const files = (req.files as any)?.doc || (req.files as any)?.files || (req.files as any)?.['files[]'];

  if (!files || files.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Please upload a valid CSV or Excel file.');
  }

  const file = files[0];
  
  const result = await ImportService.processTrialFile(file.path, file.mimetype);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Data extracted successfully for preview',
    data: result,
  });
});

export const ImportController = {
  importTrialData,
};

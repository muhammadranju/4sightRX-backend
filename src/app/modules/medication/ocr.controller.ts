import { Request, Response } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { extractMedicationsFromImage } from '../formulary-comparison/gemini.service';
import { LogService } from '../log/log.service';
import ApiError from '../../../errors/ApiError';

/**
 * Handles prescription image upload and uses Gemini AI to extract medication details.
 */
const extractMedications = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const filesData = req.files as any;
  const imageFiles = filesData?.image || filesData?.files || filesData?.['files[]'];

  if (!imageFiles || imageFiles.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Prescription image is required',
    );
  }

  const files = imageFiles;
  let allExtractedData: any[] = [];

  for (const file of files) {
    const imageBuffer = fs.readFileSync(file.path);
    try {
      const extractedData = await extractMedicationsFromImage(
        imageBuffer,
        file.mimetype,
      );
      allExtractedData = [...allExtractedData, ...extractedData];
      fs.unlinkSync(file.path);
    } catch (error) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      console.error(`Failed to extract from ${file.originalname}`, error);
    }
  }

  // Log extraction
  await LogService.createLog({
    organizationId: user.organizationId,
    type: 'extraction',
    details: allExtractedData,
    source: 'gemini_vision_multi',
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Medications extracted successfully',
    data: allExtractedData,
  });
});

export const OcrController = {
  extractMedications,
};

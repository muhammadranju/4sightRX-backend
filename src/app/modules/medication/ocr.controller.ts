import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import fs from 'fs';
import ApiError from '../../../errors/ApiError';
import { extractMedicationsFromImage } from '../formulary-comparison/gemini.service';

/**
 * Handles prescription image upload and uses Gemini AI to extract medication details.
 */
const extractMedications = catchAsync(async (req: Request, res: Response) => {
  // if (
  //   !req.files ||
  //   !('image' in req.files) ||
  //   (req.files as any).image.length === 0
  // ) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     'Prescription image is required',
  //   );
  // }

  const file = (req.files as any).image[0];
  const imageBuffer = fs.readFileSync(file.path);

  try {
    const extractedData = await extractMedicationsFromImage(
      imageBuffer,
      file.mimetype,
    );

    // After extraction, we cleanup the file (optional, but good practice since we only need the buffer)
    fs.unlinkSync(file.path);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Medications extracted successfully',
      data: extractedData,
    });
  } catch (error) {
    // Cleanup on error too
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
});

export const OcrController = {
  extractMedications,
};

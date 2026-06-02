/* eslint-disable no-unused-vars */
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { mapTrialData } from '../../utils/dataMapper';
import { parseFile } from '../../utils/fileParser';

// ── Required fields for a valid MedicationTier record ─────────────────────────
const REQUIRED_FIELDS: (keyof ReturnType<typeof mapTrialData>[number])[] = [
  'tier',
  'medication',
  'strength',
  'route',
  'frequency',
];

interface InvalidRecord {
  rowIndex: number;
  missingFields: string[];
  rawRow?: any;
}

const processTrialFile = async (filePath: string, mimeType: string) => {
  try {
    // ── Step 1: Parse the uploaded file ───────────────────────────────────────
    console.log(`[Import] Parsing file: ${filePath} (type: ${mimeType})`);
    const rawData = await parseFile(filePath, mimeType);

    if (!rawData || rawData.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The uploaded file is empty or contains no data rows.',
      );
    }
    console.log(`[Import] Raw rows extracted: ${rawData.length}`);

    // ── Step 2: Map columns → MedicationTier schema ───────────────────────────
    const mappedData = mapTrialData(rawData);

    // ── Step 3: Separate valid records from invalid ones ──────────────────────
    const validRecords: typeof mappedData = [];
    const invalidRecords: InvalidRecord[] = [];

    mappedData.forEach((record, index) => {
      const missingFields = REQUIRED_FIELDS.filter(
        field => !record[field as keyof typeof record],
      );

      // Debug log: show every record's cost mapping result
      console.log(
        `[Import] Row ${index + 1} → medication="${record.medication}" | monthlyCost=${record.monthlyCost}`,
      );

      if (missingFields.length > 0) {
        invalidRecords.push({
          rowIndex: index + 1,
          missingFields,
        });
      } else {
        validRecords.push(record);
      }
    });

    console.log(
      `[Import] Valid: ${validRecords.length} | Invalid: ${invalidRecords.length}`,
    );

    if (validRecords.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `No valid records found. All ${rawData.length} rows failed validation. ` +
          `Please ensure your file contains columns: Tier, Medication, Strength, Route, Freq.`,
      );
    }

    // ── Step 4: Clean up the temporary uploaded file ─────────────────────────
    fs.unlinkSync(filePath);

    return {
      totalRecords: rawData.length,
      processedRecords: validRecords.length,
      failedRecords: invalidRecords.length,
      invalidRows: invalidRecords.length > 0 ? invalidRecords : undefined,
      data: validRecords,
    };
  } catch (error: any) {
    // Attempt cleanup even on failure
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (_) {
      // Ignore cleanup errors
    }

    if (error instanceof ApiError) {
      throw error;
    }

    console.error('[Import] Unexpected error:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to process file: ${error.message}`,
    );
  }
};

export const ImportService = {
  processTrialFile,
};

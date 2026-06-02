import fs from 'fs';
import csv from 'csv-parser';
import * as xlsx from 'xlsx';

export const parseFile = async (
  filePath: string,
  mimeType: string,
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    if (mimeType === 'text/csv') {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    } else if (
      mimeType === 'application/vnd.ms-excel' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    } else {
      reject(new Error('Unsupported file type for parsing.'));
    }
  });
};

import { GoogleGenerativeAI } from '@google/generative-ai';
// eslint-disable-next-line no-undef
const pdf = require('pdf-parse');

// ─── Type Definitions ────────────────────────────────────────────────────────

/**
 * The strict shape Gemini MUST respond with.
 */
export interface IAIRecommendationResponse {
  recommendedMedication: string;
  rationale: string;
  estimatedSavings: number;
  hospiceCovered: boolean;
}

/**
 * Input gathered from the orchestration layer
 */
export interface IGeminiPromptInput {
  currentMedication: string;
  therapeuticAlternative: string | null;
}

export interface IOcrExtractedMedication {
  medicationName: string;
  strength: string;
  form: string;
  dose: string;
  route: string;
  frequency: string;
  duration?: string;
}

// ─── Constants & Configuration ──────────────────────────────────────────────

const STABLE_MODEL = 'gemini-2.5-flash';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

// ─── Retry Utility ──────────────────────────────────────────────────────────

/**
 * Executes a function with exponential backoff retry logic.
 * Specifically handles Gemini 503 (high demand) and timeout errors.
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = INITIAL_RETRY_DELAY,
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const isRetryable =
      error?.status === 503 ||
      error?.message?.includes('503') ||
      error?.message?.includes('Service Unavailable') ||
      error?.message?.includes('deadline exceeded') ||
      error?.message?.includes('high demand');

    if (isRetryable && retries > 0) {
      console.warn(
        `[GeminiService] Transient error detected. Retrying in ${delay}ms... (${retries} attempts left)`,
      );
      // eslint-disable-next-line no-undef
      await new Promise(resolve => setTimeout(resolve, delay));
      return executeWithRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// ─── Fallback Mock Response ─────────────────────────────────────────────────

const buildFallbackResponse = (
  input: IGeminiPromptInput,
): IAIRecommendationResponse => ({
  recommendedMedication:
    input.therapeuticAlternative ?? input.currentMedication,
  rationale: input.therapeuticAlternative
    ? `Therapeutic equivalent available: ${input.therapeuticAlternative}.`
    : 'Continue current therapy. No alternative found in formulary.',
  estimatedSavings: 0,
  hospiceCovered: false,
});

// ─── Prompt Builders ────────────────────────────────────────────────────────

export const buildGeminiPrompt = (input: IGeminiPromptInput): string => {
  return `You are a clinical pharmacist and medication optimization expert.
Your ONLY job is to recommend the best therapeutic alternative to the given medication.

Current Medication: "${input.currentMedication}"
Suggested Alternative (use this if clinically appropriate): ${input.therapeuticAlternative ? `"${input.therapeuticAlternative}"` : 'Not provided — you must suggest one'}

STRICT RULES:
1. "recommendedMedication" MUST be a real, specific drug name. NEVER use "Continue Current Therapy".
2. The recommended drug MUST be different from "${input.currentMedication}".
3. If a suggested alternative is provided, use it unless clinically inappropriate.
4. "estimatedSavings" = estimated yearly savings in USD. Must be an integer ≥ 0.
5. "hospiceCovered" = true if typically covered under hospice.
6. "rationale" = concise 1–2 sentence clinical justification.

Respond ONLY with this exact JSON structure:
{
  "recommendedMedication": "string",
  "rationale": "string",
  "estimatedSavings": number,
  "hospiceCovered": boolean
}`;
};

const buildOcrPrompt = (context: string = 'prescription image'): string => {
  return `You are a medical transcription assistant.
Analyze the provided ${context} and extract all medications.
Respond ONLY with a JSON array of objects. No markdown. No explanation.

Shape:
[{
  "medicationName": "string",
  "strength": "string",
  "form": "string",
  "dose": "string",
  "route": "string",
  "frequency": "string",
  "duration": "string (optional)"
}]

Rules:
- If a value is not found, use an empty string.
- Standardize route (PO, SL, IV, etc.) and frequency (QD, BID, TID, PRN, etc.).
- Extract exactly what is written.`;
};

// ─── Gemini AI Callers ───────────────────────────────────────────────────────

export const callGeminiAI = async (
  input: IGeminiPromptInput,
): Promise<IAIRecommendationResponse> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[GeminiService] API Key missing, using fallback');
    return buildFallbackResponse(input);
  }

  return executeWithRetry(async () => {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: STABLE_MODEL });
      const prompt = buildGeminiPrompt(input);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();

      const cleaned = rawText.replace(/```json\s*|```/gi, '').trim();
      return JSON.parse(cleaned) as IAIRecommendationResponse;
    } catch (error) {
      console.error('[GeminiService] AI Call failed', error);
      throw error;
    }
  }).catch(err => {
    console.error('[GeminiService] Final failure after retries', err);
    return buildFallbackResponse(input);
  });
};

// ─── File Extraction (OCR & PDF) ─────────────────────────────────────────────

/**
 * Extracts medications from either an image or a PDF.
 * Uses pdf-parse for text-based PDFs.
 * Uses Gemini 2.5 Flash to extract medication details from an image.
 */
export const extractMedicationsFromImage = async (
  fileBuffer: Buffer,
  mimeType: string,
): Promise<IOcrExtractedMedication[]> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  try {
    let textContent = '';

    // 1. If PDF, try text extraction first
    if (mimeType === 'application/pdf') {
      try {
        const data = await pdf(fileBuffer);
        textContent = data.text.trim();
        console.log(
          `[GeminiOCR] PDF text extraction length: ${textContent.length}`,
        );
      } catch (pdfError) {
        console.warn(
          '[GeminiOCR] pdf-parse failed, falling back to Gemini Vision',
          pdfError,
        );
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: STABLE_MODEL });

    return await executeWithRetry(async () => {
      let result;

      if (textContent && textContent.length > 50) {
        // Use text-based extraction
        const prompt = buildOcrPrompt('extracted PDF text content');
        result = await model.generateContent(
          `${prompt}\n\nCONTENT:\n${textContent}`,
        );
      } else {
        // Use Vision-based extraction (Image or Scanned PDF)
        const prompt = buildOcrPrompt(
          mimeType.includes('pdf') ? 'PDF document' : 'prescription image',
        );
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: fileBuffer.toString('base64'),
              mimeType,
            },
          },
        ]);
      }

      const response = await result.response;
      const rawText = response.text();
      const cleaned = rawText.replace(/```json\s*|```/gi, '').trim();
      const parsed = JSON.parse(cleaned);

      return Array.isArray(parsed) ? (parsed as IOcrExtractedMedication[]) : [];
    });
  } catch (error: any) {
    console.error('[GeminiOCR] Full extraction flow failed', error);

    // Provide a more descriptive error message
    const detail = error?.message || 'Unknown Gemini Error';
    throw new Error(`Medication extraction failed: ${detail}`);
  }
};

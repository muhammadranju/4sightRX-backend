import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Type Definitions ────────────────────────────────────────────────────────

/**
 * The strict shape Gemini MUST respond with.
 * Any deviation triggers the fallback mock response.
 */
export interface IAIRecommendationResponse {
  recommendedMedication: string;
  rationale: string;
  estimatedSavings: number;
  hospiceCovered: boolean;
}

/**
 * Input gathered from the orchestration layer
 * before building the Gemini prompt.
 */
export interface IGeminiPromptInput {
  currentMedication: string;
  therapeuticAlternative: string | null;
}

// ─── Fallback Mock Response ─────────────────────────────────────────────────

/**
 * Used when Gemini is unavailable or returns malformed JSON.
 * Prevents the entire reconciliation session from failing.
 */
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

// ─── Prompt Builder ─────────────────────────────────────────────────────────

/**
 * Builds the clinical prompt string sent to Gemini.
 * Always forces an AI-recommended alternative — never "Continue Current Therapy".
 * estimatedSavings = estimated yearly savings in USD (current med cost - alternative med cost).
 */
export const buildGeminiPrompt = (input: IGeminiPromptInput): string => {
  return `You are a clinical pharmacist and medication optimization expert.

Your ONLY job is to recommend the best therapeutic alternative to the given medication.

Current Medication: "${input.currentMedication}"
Suggested Alternative (use this if clinically appropriate): ${input.therapeuticAlternative ? `"${input.therapeuticAlternative}"` : 'Not provided — you must suggest one'}

STRICT RULES — you MUST follow all of these:
1. "recommendedMedication" MUST be a real, specific drug name (brand or generic). NEVER use phrases like "Continue Current Therapy", "No change", or placeholder text.
2. The recommended drug MUST be different from "${input.currentMedication}".
3. If a suggested alternative is provided, use it unless clinically inappropriate.
4. If no alternative is provided, use your medical knowledge to suggest the most common therapeutic equivalent or generic substitute.
5. "estimatedSavings" = estimated yearly savings in USD if the patient switches from "${input.currentMedication}" to the recommended medication. Use typical US retail prices. Must be an integer ≥ 0.
6. "hospiceCovered" = true if the recommended medication is typically covered under hospice formularies, otherwise false.
7. "rationale" = a concise 1–2 sentence clinical justification for the recommendation.

Respond ONLY with this exact JSON structure. No markdown, no extra text, no explanations outside the JSON:
{
  "recommendedMedication": "string",
  "rationale": "string",
  "estimatedSavings": number,
  "hospiceCovered": boolean
}`;
};

// ─── Gemini AI Caller ────────────────────────────────────────────────────────

/**
 * Calls the Google Gemini API and returns a parsed, type-safe recommendation.
 * Falls back to a mock response on any failure.
 */
export const callGeminiAI = async (
  input: IGeminiPromptInput,
): Promise<IAIRecommendationResponse> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn(
      '[GeminiService] GEMINI_API_KEY not set — using fallback response',
    );
    return buildFallbackResponse(input);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = buildGeminiPrompt(input);
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // Strip markdown code fences if Gemini wraps output in ```json ... ```
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    const parsed: unknown = JSON.parse(cleaned);

    // ── Strict validation of parsed shape ──────────────────────────────────
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).recommendedMedication !==
        'string' ||
      typeof (parsed as Record<string, unknown>).rationale !== 'string' ||
      typeof (parsed as Record<string, unknown>).estimatedSavings !==
        'number' ||
      typeof (parsed as Record<string, unknown>).hospiceCovered !== 'boolean'
    ) {
      console.error(
        '[GeminiService] AI returned invalid JSON shape — using fallback',
      );
      return buildFallbackResponse(input);
    }

    return parsed as IAIRecommendationResponse;
  } catch (error) {
    console.error('[GeminiService] Gemini call failed — using fallback', error);
    return buildFallbackResponse(input);
  }
};

// ─── Gemini OCR (Vision) ─────────────────────────────────────────────────────

export interface IOcrExtractedMedication {
  medicationName: string;
  strength: string;
  form: string;
  dose: string;
  route: string;
  frequency: string;
  duration?: string;
}

/**
 * Uses Gemini 1.5 Flash to extract medication details from an image.
 */
export const extractMedicationsFromImage = async (
  imageBuffer: Buffer,
  mimeType: string,
): Promise<IOcrExtractedMedication[]> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a medical transcription assistant.
Analyze the provided prescription image and extract all medications.
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
- Standardize route (e.g., PO, SL, IV, etc.) and frequency (QD, BID, TID, PRN, etc.) if possible.
- Extract exactly what is written on the prescription.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType,
        },
      },
    ]);

    const rawText = result.response.text();
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    const parsed: unknown = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      console.error('[GeminiOCR] Response is not an array');
      return [];
    }

    return parsed as IOcrExtractedMedication[];
  } catch (error) {
    console.error('[GeminiOCR] Extraction failed', error);
    throw new Error('Failed to extract medications from image');
  }
};

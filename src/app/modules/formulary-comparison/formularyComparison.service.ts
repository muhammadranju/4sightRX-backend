import mongoose from 'mongoose';
import Medication from '../medication/medication.model';
import Therapeutic from '../therapeutic/therapeutic.model';
import {
  FormularyAction,
  IFormularyComparison,
  IFormularyInterchange,
} from './formularyComparison.interface';
import FormularyComparison from './formularyComparison.model';
import { AnalyzeInput } from './formularyComparison.validation';
import FormularyInterchange from './formularyInterchange.model';
import { callGeminiAI, IGeminiPromptInput } from './gemini.service';
import { generateFormularyPDF } from './formularyComparison.utils';
import { nanoid } from 'nanoid';

export interface IFormularyComparisonSummary {
  continuedMedications: IFormularyComparison[]; // All medicines user accepted
  discontinuedMedications: IFormularyComparison[]; // All medicines user discontinued
  declinedMedications: IFormularyComparison[]; // All medicines user declined
  totalEstimatedMonthlySavings: number;
}

export const calculateTotalSavings = (docs: IFormularyComparison[]): number => {
  return docs
    .filter(doc => doc.action === 'accepted')
    .reduce((sum, doc) => sum + (doc.estimatedSavings ?? 0), 0);
};

export const analyzeFormularyService = async (
  input: AnalyzeInput,
  patientId: string,
  organizationId: string,
): Promise<IFormularyComparison[]> => {
  const { medicationIds } = input;
  const sessionId = nanoid(); // Generate a unique ID for this session

  // ── Fetch all medications in one query ─────────────────────────────────────
  const validIds = medicationIds.filter(id => mongoose.isValidObjectId(id));
  if (validIds.length === 0) {
    throw new Error('No valid medication IDs provided');
  }

  const medications = await Medication.find({ _id: { $in: validIds }, organizationId }).lean();

  if (medications.length === 0) {
    throw new Error('No medications found for the provided IDs');
  }

  // ── Process each medication in parallel ───────────────────────────────────
  const results = await Promise.all(
    medications.map(async medication => {
      const nameKey = medication.medicationName.toLowerCase();

      // 1. Therapeutic alternative lookup via new drugName field (stored lowercase)
      // Now filtered by organizationId to ensure organization-specific formulary
      const therapeutic = await Therapeutic.findOne({
        drugName: nameKey,
        organizationId: organizationId,
      }).lean();

      // 2. Build prompt input
      const promptInput: IGeminiPromptInput = {
        currentMedication: `${medication.medicationName} ${medication.strength} — ${medication.dose} ${medication.frequency}`,
        therapeuticAlternative: therapeutic ? therapeutic.alternative : null,
      };

      // 4. Call Gemini AI (or fallback if Gemini is unavailable)
      const aiResponse = await callGeminiAI(promptInput);

      // 5. Persist recommendation using new+save for correct Mongoose v9 typing
      const doc = new FormularyComparison({
        organizationId,
        medicationId: medication._id,
        patientId,
        sessionId, // Attach the session ID
        currentMedication: medication.medicationName,
        recommendedMedication: aiResponse.recommendedMedication,
        rationale: aiResponse.rationale,
        estimatedSavings: aiResponse.estimatedSavings,
        hospiceCovered: aiResponse.hospiceCovered,
        // action: 'pending',
      });
      const comparison = await doc.save();

      return comparison.toObject() as unknown as IFormularyComparison;
    }),
  );

  return results;
};

export const updateActionService = async (
  comparisonId: string,
  payload: {
    action: FormularyAction;
    acceptNote?: string;
    declineReason?: string;
    declineNote?: string;
  },
): Promise<IFormularyComparison> => {
  if (!mongoose.isValidObjectId(comparisonId)) {
    throw new Error(`Invalid comparison ID: ${comparisonId}`);
  }

  const updated = await FormularyComparison.findByIdAndUpdate(
    comparisonId,
    { $set: payload },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) {
    throw new Error(`FormularyComparison not found: ${comparisonId}`);
  }

  return updated as unknown as IFormularyComparison;
};

export const getSummaryService = async (
  patientId: string,
  organizationId?: string,
): Promise<IFormularyComparisonSummary> => {
  if (!mongoose.isValidObjectId(patientId)) {
    throw new Error(`Invalid patient ID: ${patientId}`);
  }

  const query: any = { patientId };
  if (organizationId) {
    query.organizationId = organizationId;
  }
  const latestRecord = await FormularyComparison.findOne(query)
    .sort({ createdAt: -1 })
    .lean();

  if (!latestRecord) {
    return {
      continuedMedications: [],
      discontinuedMedications: [],
      declinedMedications: [],
      totalEstimatedMonthlySavings: 0,
    };
  }

  // 2. Fetch all records belonging to the same session
  // If sessionId exists, we use it. Otherwise, we fallback to a 1-minute window of the latest record's createdAt.
  const sessionQuery: any = { patientId };
  if (organizationId) {
    sessionQuery.organizationId = organizationId;
  }
  if (latestRecord.sessionId) {
    sessionQuery.sessionId = latestRecord.sessionId;
  } else {
    const windowStart = new Date(latestRecord.createdAt.getTime() - 60000);
    sessionQuery.createdAt = { $gte: windowStart };
  }

  const all = await FormularyComparison.find(sessionQuery)
    .populate('medicationId', 'medicationName strength dose frequency')
    .populate('patientId')
    .sort({ createdAt: -1 })
    .lean();

  const docs = all as unknown as IFormularyComparison[];

  // 1. Continued Medicines: All medicines the user accepted
  const continuedMedications = docs.filter(d => d.action === 'accepted');

  // 2. Discontinued Medicines: All medicines the user discontinued
  const discontinuedMedications = docs.filter(d => d.action === 'discontinued');

  // 3. Declined Medicines: All medicines the user declined
  const declinedMedications = docs.filter(d => d.action === 'declined');

  return {
    continuedMedications,
    discontinuedMedications,
    declinedMedications,
    totalEstimatedMonthlySavings: calculateTotalSavings(docs),
  };
};

export const getFormularyInterchangeService = async (
  page: number,
  limit: number,
  search: string,
  organizationId?: string,
) => {
  const query: any = {};
  if (search) {
    query.currentMedication = { $regex: search, $options: 'i' };
  }

  if (organizationId) {
    query.organizationId = organizationId;
  }

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    FormularyInterchange.find(query)
      .populate('agencyId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FormularyInterchange.countDocuments(query),
  ]);

  return {
    data: data as unknown as IFormularyInterchange[],
    total,
    page,
    limit,
  };
};

export const createFormularyInterchangeService = async (
  payload: IFormularyInterchange,
) => {
  const {
    organizationId,
    currentMedication,
    alternativeDrug,
    rationale,
    estimatedSavings,
    dosageEquivalence,
  } = payload;

  const doc = new FormularyInterchange({
    organizationId,
    currentMedication,
    alternativeDrug,
    rationale,
    estimatedSavings,
    dosageEquivalence,
  });

  const comparison = await doc.save();

  return comparison.toObject();
};

export const updateFormularyInterchangeService = async (
  id: string,
  payload: IFormularyInterchange,
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(`Invalid ID: "${id}". Must be a valid MongoDB ObjectId.`);
  }

  const { ...data } = payload;

  const doc = await FormularyInterchange.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true },
  ).lean();

  if (!doc) {
    throw new Error(`FormularyInterchange not found: ${id}`);
  }

  return doc;
};

export const generateSummaryPDFService = async (
  patientId: string,
): Promise<Buffer> => {
  const summary = await getSummaryService(patientId);
  const pdfBuffer = await generateFormularyPDF(summary);
  return pdfBuffer;
};

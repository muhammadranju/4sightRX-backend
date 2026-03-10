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

export interface IFormularyComparisonSummary {
  changedMedications: IFormularyComparison[]; // Accepted recommendations
  continuedMedications: IFormularyComparison[]; // Recommendations where no change was made
  discontinuedMedications: IFormularyComparison[]; // Medications marked for discontinuation
  totalEstimatedMonthlySavings: number;
}

export const calculateTotalSavings = (docs: IFormularyComparison[]): number => {
  return docs
    .filter(doc => doc.action === 'accepted')
    .reduce((sum, doc) => sum + (doc.estimatedSavings ?? 0), 0);
};

export const analyzeFormularyService = async (
  input: AnalyzeInput,
): Promise<IFormularyComparison[]> => {
  const { medicationIds } = input;

  // ── Fetch all medications in one query ─────────────────────────────────────
  const validIds = medicationIds.filter(id => mongoose.isValidObjectId(id));
  if (validIds.length === 0) {
    throw new Error('No valid medication IDs provided');
  }

  const medications = await Medication.find({ _id: { $in: validIds } }).lean();

  if (medications.length === 0) {
    throw new Error('No medications found for the provided IDs');
  }

  // ── Process each medication in parallel ───────────────────────────────────
  const results = await Promise.all(
    medications.map(async medication => {
      const nameKey = medication.medicationName.toLowerCase();

      // 1. Therapeutic alternative lookup via new drugName field (stored lowercase)
      const therapeutic = await Therapeutic.findOne({
        drugName: nameKey,
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
        medicationId: medication._id,

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

export const getSummaryService =
  async (): Promise<IFormularyComparisonSummary> => {
    const all = await FormularyComparison.find()
      .populate('medicationId', 'medicationName strength dose frequency')
      .lean()
      .sort({ createdAt: -1 });

    const docs = all as unknown as IFormularyComparison[];

    // 1. Changed: Accepted recommendations
    const changedMedications = docs.filter(d => d.action === 'accepted');

    // 2. Discontinued: Explicitly discontinued or declined (per user flow Step 5)
    // Note: user requested "Medications marked as Declined or Discontinued" go here
    const discontinuedMedications = docs.filter(
      d => d.action === 'discontinued' || d.action === 'declined',
    );

    // 3. Continued: Medications with "no change" (pending or where recommended === current)
    // We'll treat 'pending' as continued for the final summary if not otherwise acted upon
    const continuedMedications = docs.filter(
      d => d.action === 'pending' && !changedMedications.includes(d),
    );

    return {
      changedMedications,
      continuedMedications,
      discontinuedMedications,
      totalEstimatedMonthlySavings: calculateTotalSavings(docs),
    };
  };

export const getFormularyInterchangeService = async (): Promise<
  IFormularyInterchange[]
> => {
  const all = await FormularyInterchange.find().lean().sort({ createdAt: -1 });

  const docs = all as unknown as IFormularyInterchange[];

  return docs;
};

export const createFormularyInterchangeService = async (
  payload: IFormularyInterchange,
) => {
  const {
    currentMedication,
    alternativeDrug,
    rationale,
    estimatedSavings,
    dosageEquivalence,
  } = payload;

  const doc = new FormularyInterchange({
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

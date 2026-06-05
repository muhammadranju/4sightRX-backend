import { MedicationMatchingEngine } from './medicationMatching.engine';
import {
  callGeminiAI,
  IGeminiPromptInput,
} from '../formulary-comparison/gemini.service';
import { IMedicationTier } from '../medicationTier/medicationTier.interface';

export type RecommendationType =
  | 'CONTINUE'
  | 'INTERCHANGE'
  | 'DEPRESCRIBE'
  | 'CAUTION'
  | 'REVIEW'
  | 'AI_ASSISTED';

export interface RecommendationResult {
  recommendationType: RecommendationType;
  currentMedication: string;
  recommendedMedication?: string;
  rationale: string;
  estimatedSavings?: number;
  hospiceCovered: boolean;
  matchConfidence: number;
  matchType: string;
  clinicalConsiderations?: string;
  reviewRequired?: boolean;
  source?: string;
  alternativeMonthlyCost?: number;
}

export class RecommendationEngine {
  private matchingEngine: MedicationMatchingEngine;

  constructor() {
    this.matchingEngine = new MedicationMatchingEngine();
  }

  async generateRecommendation(
    medicationName: string,
    strength?: string,
    route?: string,
  ): Promise<RecommendationResult> {
    const match = await this.matchingEngine.matchMedication(
      medicationName,
      strength,
      route,
    );

    if (!match) {
      return await this.generateAIFallbackRecommendation(
        medicationName,
        strength,
        route,
      );
    }

    const { entry, category, confidence, matchType } = match;
    const genericName = entry.medication || medicationName;
    const brandName = entry.brandName;
    const fullMedName = brandName
      ? `${genericName} (${brandName})`
      : genericName;
    const estimatedSavings = entry.monthlyCost || null;

    switch (category) {
      case 'preferred':
        return this.generateContinueRecommendation(
          fullMedName,
          entry,
          confidence,
          matchType,
          estimatedSavings,
        );

      case 'nonFormulary':
        return this.generateInterchangeRecommendation(
          fullMedName,
          entry,
          confidence,
          matchType,
          estimatedSavings,
        );

      case 'deprescribe':
        return this.generateDeprescribeRecommendation(
          fullMedName,
          entry,
          confidence,
          matchType,
          estimatedSavings,
        );

      default:
        return await this.generateAIFallbackRecommendation(
          medicationName,
          strength,
          route,
        );
    }
  }

  private async generateAIFallbackRecommendation(
    medicationName: string,
    strength?: string,
    route?: string,
  ): Promise<RecommendationResult> {
    try {
      const promptInput: IGeminiPromptInput = {
        currentMedication:
          `${medicationName} ${strength || ''} — ${route || ''}`.trim(),
        therapeuticAlternative: null,
      };

      const aiResponse = await callGeminiAI(promptInput);

      return {
        recommendationType: 'AI_ASSISTED',
        currentMedication: medicationName,
        recommendedMedication: aiResponse.recommendedMedication,
        rationale: aiResponse.rationale,
        estimatedSavings: aiResponse.estimatedSavings,
        hospiceCovered: aiResponse.hospiceCovered,
        matchConfidence: 0.5,
        matchType: 'ai_fallback',
        reviewRequired: true,
        source: 'Gemini Fallback Engine',
        alternativeMonthlyCost: aiResponse.alternativeMonthlyCost,
      };
    } catch (error) {
      console.error('AI fallback failed:', error);
      return {
        recommendationType: 'REVIEW',
        currentMedication: medicationName,
        rationale:
          'No reliable match found and AI fallback failed. Please review manually.',
        hospiceCovered: false,
        matchConfidence: 0,
        matchType: 'none',
        reviewRequired: true,
      };
    }
  }

  private generateContinueRecommendation(
    medicationName: string,
    entry: IMedicationTier,
    confidence: number,
    matchType: string,
    estimatedSavings: number | null,
  ): RecommendationResult {
    return {
      recommendationType: 'CONTINUE',
      currentMedication: medicationName,
      rationale:
        'Medication is on the preferred formulary and may be continued.',
      estimatedSavings: estimatedSavings || undefined,
      hospiceCovered: true,
      matchConfidence: confidence,
      matchType,
      reviewRequired: false,
      source: 'Formulary Database',
      alternativeMonthlyCost: entry.alternativeMonthlyCost || undefined,
    };
  }

  private generateInterchangeRecommendation(
    medicationName: string,
    entry: IMedicationTier,
    confidence: number,
    matchType: string,
    estimatedSavings: number | null,
  ): RecommendationResult {
    const primaryAlternative = entry.preferredAlternative;

    let rationale =
      'This medication is non-formulary. Consider therapeutic interchange.';
    if (
      primaryAlternative &&
      primaryAlternative !== 'N/A' &&
      primaryAlternative !== '—'
    ) {
      rationale += ` Recommended alternative: ${primaryAlternative}`;
    }

    return {
      recommendationType: 'INTERCHANGE',
      currentMedication: medicationName,
      recommendedMedication:
        primaryAlternative &&
        primaryAlternative !== 'N/A' &&
        primaryAlternative !== '—'
          ? primaryAlternative
          : undefined,
      rationale,
      estimatedSavings: estimatedSavings || undefined,
      hospiceCovered: false,
      matchConfidence: confidence,
      matchType,
      reviewRequired: true,
      source: 'Formulary Database',
      alternativeMonthlyCost: entry.alternativeMonthlyCost || undefined,
    };
  }

  private generateDeprescribeRecommendation(
    medicationName: string,
    entry: IMedicationTier,
    confidence: number,
    matchType: string,
    estimatedSavings: number | null,
  ): RecommendationResult {
    let rationale =
      'This medication should be deprescribed or reconsidered in hospice care.';

    return {
      recommendationType: 'DEPRESCRIBE',
      currentMedication: medicationName,
      rationale,
      estimatedSavings: estimatedSavings || undefined,
      hospiceCovered: false,
      matchConfidence: confidence,
      matchType,
      reviewRequired: true,
      source: 'Formulary Database',
      alternativeMonthlyCost: entry.alternativeMonthlyCost || undefined,
    };
  }
}

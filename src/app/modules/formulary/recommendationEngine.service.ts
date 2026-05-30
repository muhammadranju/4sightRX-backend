import { MedicationMatchingEngine } from './medicationMatching.engine';
import {
  callGeminiAI,
  IGeminiPromptInput,
} from '../formulary-comparison/gemini.service';

interface FormularyEntry {
  tier?: string;
  Tier?: string;
  generic?: string;
  Generic?: string;
  brand?: string;
  Brand?: string;
  strength_form?: string;
  Strength_Form?: string;
  route?: string;
  Route?: string;
  typical_dose?: string;
  Typical_Dose?: string;
  frequency?: string;
  Frequency?: string;
  unit_cost?: string;
  Unit_Cost?: string;
  estimated_30_day_cost?: string;
  Estimated_30_Day_Cost?: string;
  primary_alternative?: string;
  Primary_Alternative?: string;
  secondary_alternative?: string;
  Secondary_Alternative?: string;
  clinical_considerations?: string;
  Clinical_Considerations?: string;
}

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
    const genericName = entry.generic || entry.Generic || medicationName;
    const brandName = entry.brand || entry.Brand;
    const fullMedName = brandName
      ? `${genericName} (${brandName})`
      : genericName;
    const estimatedSavings = this.parseCost(
      entry.estimated_30_day_cost || entry.Estimated_30_Day_Cost,
    );

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

  private parseCost(costStr: string | undefined): number | null {
    if (
      !costStr ||
      costStr === 'N/A' ||
      costStr === '—' ||
      costStr === 'Variable'
    ) {
      return null;
    }
    const match = costStr.match(/\$?([\d,.]+)/);
    if (match) {
      const num = parseFloat(match[1].replace(/,/g, ''));
      return isNaN(num) ? null : num;
    }
    return null;
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
    entry: FormularyEntry,
    confidence: number,
    matchType: string,
    estimatedSavings: number | null,
  ): RecommendationResult {
    const clinicalConsiderations =
      entry.clinical_considerations || entry.Clinical_Considerations;

    return {
      recommendationType: 'CONTINUE',
      currentMedication: medicationName,
      rationale:
        'Medication is on the preferred formulary and may be continued.',
      estimatedSavings: estimatedSavings || undefined,
      hospiceCovered: true,
      matchConfidence: confidence,
      matchType,
      clinicalConsiderations,
      reviewRequired: false,
      source: 'Formulary Database',
    };
  }

  private generateInterchangeRecommendation(
    medicationName: string,
    entry: FormularyEntry,
    confidence: number,
    matchType: string,
    estimatedSavings: number | null,
  ): RecommendationResult {
    const primaryAlternative =
      entry.primary_alternative || entry.Primary_Alternative;
    const secondaryAlternative =
      entry.secondary_alternative || entry.Secondary_Alternative;
    const clinicalConsiderations =
      entry.clinical_considerations || entry.Clinical_Considerations;

    let rationale =
      'This medication is non-formulary. Consider therapeutic interchange.';
    if (
      primaryAlternative &&
      primaryAlternative !== 'N/A' &&
      primaryAlternative !== '—'
    ) {
      rationale += ` Recommended alternative: ${primaryAlternative}`;
    }
    if (clinicalConsiderations) {
      rationale += ` ${clinicalConsiderations}`;
    }

    return {
      recommendationType: 'INTERCHANGE',
      currentMedication: medicationName,
      recommendedMedication:
        primaryAlternative &&
        primaryAlternative !== 'N/A' &&
        primaryAlternative !== '—'
          ? primaryAlternative
          : secondaryAlternative,
      rationale,
      estimatedSavings: estimatedSavings || undefined,
      hospiceCovered: false,
      matchConfidence: confidence,
      matchType,
      clinicalConsiderations,
      reviewRequired: true,
      source: 'Formulary Database',
    };
  }

  private generateDeprescribeRecommendation(
    medicationName: string,
    entry: FormularyEntry,
    confidence: number,
    matchType: string,
    estimatedSavings: number | null,
  ): RecommendationResult {
    const clinicalConsiderations =
      entry.clinical_considerations || entry.Clinical_Considerations;

    let rationale =
      'This medication should be deprescribed or reconsidered in hospice care.';
    if (clinicalConsiderations) {
      rationale += ` ${clinicalConsiderations}`;
    }

    return {
      recommendationType: 'DEPRESCRIBE',
      currentMedication: medicationName,
      rationale,
      estimatedSavings: estimatedSavings || undefined,
      hospiceCovered: false,
      matchConfidence: confidence,
      matchType,
      clinicalConsiderations,
      reviewRequired: true,
      source: 'Formulary Database',
    };
  }
}

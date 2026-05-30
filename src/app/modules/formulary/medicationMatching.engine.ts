import { FormularyDataService } from './formularyData.service';
import { MedicationNormalizationService } from './medicationNormalization.service';

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

interface MatchResult {
  entry: FormularyEntry;
  matchType: 'exact' | 'generic' | 'fuzzy' | 'therapeutic';
  confidence: number;
  category: 'preferred' | 'nonFormulary' | 'deprescribe';
}

export class MedicationMatchingEngine {
  private formularyDataService: FormularyDataService;

  constructor() {
    this.formularyDataService = FormularyDataService.getInstance();
  }

  async matchMedication(
    medicationName: string,
    strength?: string,
    route?: string,
  ): Promise<MatchResult | null> {
    await this.formularyDataService.loadFormularyData();

    const normalizedName =
      MedicationNormalizationService.normalizeMedicationName(medicationName);
    const normalizedRoute = route
      ? MedicationNormalizationService.normalizeRoute(route)
      : '';

    const allFormularies = this.formularyDataService.getAllFormularyEntries();

    let result: MatchResult | null = null;

    result = this.tryExactMatch(
      normalizedName,
      normalizedRoute,
      allFormularies,
    );
    if (result) return result;

    result = this.tryGenericNameMatch(
      normalizedName,
      normalizedRoute,
      allFormularies,
    );
    if (result) return result;

    result = this.tryFuzzyMatch(
      normalizedName,
      normalizedRoute,
      allFormularies,
    );
    if (result) return result;

    return null;
  }

  private tryExactMatch(
    normalizedName: string,
    normalizedRoute: string,
    formularies: {
      preferred: FormularyEntry[];
      nonFormulary: FormularyEntry[];
      deprescribe: FormularyEntry[];
    },
  ): MatchResult | null {
    const categories: Array<{
      entries: FormularyEntry[];
      category: 'preferred' | 'nonFormulary' | 'deprescribe';
    }> = [
      { entries: formularies.deprescribe, category: 'deprescribe' },
      { entries: formularies.nonFormulary, category: 'nonFormulary' },
      { entries: formularies.preferred, category: 'preferred' },
    ];

    for (const { entries, category } of categories) {
      for (const entry of entries) {
        const generic = (entry.generic || entry.Generic || '').toLowerCase();
        const brand = (entry.brand || entry.Brand || '').toLowerCase();
        const entryRoute = MedicationNormalizationService.normalizeRoute(
          entry.route || entry.Route || '',
        );

        if (
          (generic.includes(normalizedName) ||
            brand.includes(normalizedName)) &&
          (normalizedRoute === '' || entryRoute === normalizedRoute)
        ) {
          return {
            entry,
            matchType: 'exact',
            confidence: 0.95,
            category,
          };
        }
      }
    }

    return null;
  }

  private tryGenericNameMatch(
    normalizedName: string,
    normalizedRoute: string,
    formularies: {
      preferred: FormularyEntry[];
      nonFormulary: FormularyEntry[];
      deprescribe: FormularyEntry[];
    },
  ): MatchResult | null {
    const categories: Array<{
      entries: FormularyEntry[];
      category: 'preferred' | 'nonFormulary' | 'deprescribe';
    }> = [
      { entries: formularies.deprescribe, category: 'deprescribe' },
      { entries: formularies.nonFormulary, category: 'nonFormulary' },
      { entries: formularies.preferred, category: 'preferred' },
    ];

    for (const { entries, category } of categories) {
      for (const entry of entries) {
        const generic = (entry.generic || entry.Generic || '').toLowerCase();
        const entryRoute = MedicationNormalizationService.normalizeRoute(
          entry.route || entry.Route || '',
        );

        const nameWords = normalizedName.split(' ');
        const genericWords = generic.split(' ');

        const hasCommonWords = nameWords.some(
          word => word.length > 2 && genericWords.includes(word),
        );

        if (
          hasCommonWords &&
          (normalizedRoute === '' || entryRoute === normalizedRoute)
        ) {
          return {
            entry,
            matchType: 'generic',
            confidence: 0.8,
            category,
          };
        }
      }
    }

    return null;
  }

  private tryFuzzyMatch(
    normalizedName: string,
    normalizedRoute: string,
    formularies: {
      preferred: FormularyEntry[];
      nonFormulary: FormularyEntry[];
      deprescribe: FormularyEntry[];
    },
  ): MatchResult | null {
    const categories: Array<{
      entries: FormularyEntry[];
      category: 'preferred' | 'nonFormulary' | 'deprescribe';
    }> = [
      { entries: formularies.deprescribe, category: 'deprescribe' },
      { entries: formularies.nonFormulary, category: 'nonFormulary' },
      { entries: formularies.preferred, category: 'preferred' },
    ];

    for (const { entries, category } of categories) {
      for (const entry of entries) {
        const generic = (entry.generic || entry.Generic || '').toLowerCase();
        const brand = (entry.brand || entry.Brand || '').toLowerCase();
        const entryRoute = MedicationNormalizationService.normalizeRoute(
          entry.route || entry.Route || '',
        );

        if (
          (this.levenshteinDistance(normalizedName, generic) <= 3 ||
            this.levenshteinDistance(normalizedName, brand) <= 3) &&
          (normalizedRoute === '' || entryRoute === normalizedRoute)
        ) {
          return {
            entry,
            matchType: 'fuzzy',
            confidence: 0.6,
            category,
          };
        }
      }
    }

    return null;
  }

  private levenshteinDistance(s: string, t: string): number {
    if (!s.length) return t.length;
    if (!t.length) return s.length;

    const dp: number[][] = Array.from({ length: s.length + 1 }, () =>
      Array(t.length + 1).fill(0),
    );

    for (let i = 0; i <= s.length; i++) dp[i][0] = i;
    for (let j = 0; j <= t.length; j++) dp[0][j] = j;

    for (let i = 1; i <= s.length; i++) {
      for (let j = 1; j <= t.length; j++) {
        const cost = s[i - 1] === t[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost,
        );
      }
    }

    return dp[s.length][t.length];
  }
}

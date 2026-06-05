import { MedicationTier } from '../medicationTier/medicationTier.model';
import { IMedicationTier } from '../medicationTier/medicationTier.interface';
import { MedicationNormalizationService } from './medicationNormalization.service';

interface MatchResult {
  entry: IMedicationTier;
  matchType: 'exact' | 'generic' | 'fuzzy' | 'therapeutic';
  confidence: number;
  category: 'preferred' | 'nonFormulary' | 'deprescribe';
}

export class MedicationMatchingEngine {
  constructor() {}

  async matchMedication(
    medicationName: string,
    strength?: string,
    route?: string,
  ): Promise<MatchResult | null> {
    const normalizedName =
      MedicationNormalizationService.normalizeMedicationName(medicationName);
    const normalizedRoute = route
      ? MedicationNormalizationService.normalizeRoute(route)
      : '';

    let result: MatchResult | null = null;

    result = await this.tryExactMatch(normalizedName, normalizedRoute);
    if (result) return result;

    result = await this.tryGenericNameMatch(normalizedName, normalizedRoute);
    if (result) return result;

    result = await this.tryFuzzyMatch(normalizedName, normalizedRoute);
    if (result) return result;

    return null;
  }

  private mapTierToCategory(tier: string): 'preferred' | 'nonFormulary' | 'deprescribe' {
    const t = tier.toLowerCase();
    if (t.startsWith('p') || t === 'preferred') return 'preferred';
    if (t.startsWith('d') || t === 'deprescribe') return 'deprescribe';
    return 'nonFormulary';
  }

  private async tryExactMatch(
    normalizedName: string,
    normalizedRoute: string,
  ): Promise<MatchResult | null> {
    const nameRegex = new RegExp(`^${normalizedName}$`, 'i');
    const query: any = {
      $or: [{ medication: nameRegex }, { brandName: nameRegex }],
    };

    const docs = await MedicationTier.find(query).lean() as unknown as IMedicationTier[];

    for (const entry of docs) {
      const entryRoute = MedicationNormalizationService.normalizeRoute(entry.route || '');
      if (normalizedRoute === '' || entryRoute === normalizedRoute) {
        return {
          entry,
          matchType: 'exact',
          confidence: 0.95,
          category: this.mapTierToCategory(entry.tier),
        };
      }
    }

    return null;
  }

  private async tryGenericNameMatch(
    normalizedName: string,
    normalizedRoute: string,
  ): Promise<MatchResult | null> {
    const nameWords = normalizedName.split(' ').filter(w => w.length > 2);
    if (nameWords.length === 0) return null;

    const regexPattern = nameWords.join('|');
    const nameRegex = new RegExp(`\\b(${regexPattern})\\b`, 'i');

    const query: any = {
      medication: nameRegex,
    };

    const docs = await MedicationTier.find(query).lean() as unknown as IMedicationTier[];

    for (const entry of docs) {
      const entryRoute = MedicationNormalizationService.normalizeRoute(entry.route || '');
      if (normalizedRoute === '' || entryRoute === normalizedRoute) {
        return {
          entry,
          matchType: 'generic',
          confidence: 0.8,
          category: this.mapTierToCategory(entry.tier),
        };
      }
    }

    return null;
  }

  private async tryFuzzyMatch(
    normalizedName: string,
    normalizedRoute: string,
  ): Promise<MatchResult | null> {
    // Utilize text search index for candidate fetching, then apply Levenshtein distance filtering
    const query: any = {
      $text: { $search: normalizedName },
    };

    let docs: IMedicationTier[] = [];
    try {
      docs = await MedicationTier.find(query)
        .limit(50)
        .lean() as unknown as IMedicationTier[];
    } catch (error: any) {
      // Handle "text index required" error (code 27) which happens if the collection is empty/new
      if (error.code === 27 || error.message.includes('text index required')) {
        console.warn('⚠️ Text index missing or collection empty for MedicationTier. Skipping fuzzy match.');
        return null;
      }
      throw error;
    }

    for (const entry of docs) {
      const generic = (entry.medication || '').toLowerCase();
      const brand = (entry.brandName || '').toLowerCase();
      const entryRoute = MedicationNormalizationService.normalizeRoute(entry.route || '');

      if (
        (this.levenshteinDistance(normalizedName, generic) <= 3 ||
          this.levenshteinDistance(normalizedName, brand) <= 3) &&
        (normalizedRoute === '' || entryRoute === normalizedRoute)
      ) {
        return {
          entry,
          matchType: 'fuzzy',
          confidence: 0.6,
          category: this.mapTierToCategory(entry.tier),
        };
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

import { parseCostValue, resolveColumnKey } from './columnMappingConfig';

/**
 * Transforms an array of raw rows from a parsed CSV/XLSX file
 * into an array of MedicationTier-compatible objects.
 *
 * Column matching is case-insensitive and supports all variants
 * defined in columnMappingConfig.ts.
 */
export const mapTrialData = (rawData: any[]) => {
  return rawData.map((row) => {
    // Build a normalized lookup: backendField -> raw value
    const resolved: Record<string, any> = {};

    for (const rawKey of Object.keys(row)) {
      const backendField = resolveColumnKey(rawKey);
      if (backendField) {
        // Only set if not already set (first match wins, preserves priority order)
        if (resolved[backendField] === undefined) {
          resolved[backendField] = row[rawKey];
        }
      }
    }

    // Parse and normalize the monthly cost value from whatever cost column was found
    const monthlyCost = parseCostValue(resolved['monthlyCost']);

    return {
      tier: resolved['tier'] ?? null,
      medication: resolved['medication'] ?? null,
      brandName: resolved['brandName'] ?? undefined,
      strength: resolved['strength'] ?? null,
      route: resolved['route'] ?? null,
      frequency: resolved['frequency'] ?? null,
      monthlyCost,
      preferredAlternative: resolved['preferredAlternative'] || null,
    };
  });
};

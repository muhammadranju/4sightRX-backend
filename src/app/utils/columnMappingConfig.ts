/**
 * Centralized Column Mapping Configuration
 *
 * Maps all supported variations of uploaded file column headers
 * to their corresponding backend database field names.
 *
 * To add support for a new column variant, simply add a new entry here.
 * The matching is case-insensitive and whitespace-trimmed.
 */
export const COLUMN_MAPPING: Record<string, string> = {
  // --- Tier ---
  tier: 'tier',
  'drug tier': 'tier',
  formulary: 'tier',

  // --- Medication / Drug Name ---
  medication: 'medication',
  'drug name': 'medication',
  'generic name': 'medication',
  'medication name': 'medication',
  drug: 'medication',
  'brand name': 'brandName',
  brand: 'brandName',

  // --- Strength ---
  strength: 'strength',
  dosage: 'strength',
  dose: 'strength',

  // --- Route ---
  route: 'route',
  'route of administration': 'route',
  administration: 'route',

  // --- Frequency ---
  freq: 'frequency',
  frequency: 'frequency',
  'dosing frequency': 'frequency',
  schedule: 'frequency',

  // --- Monthly / 30-Day Cost ---
  '30-day': 'monthlyCost',
  '30-day cost': 'monthlyCost',
  '30 day cost': 'monthlyCost',
  '30 day': 'monthlyCost',
  'thirty day cost': 'monthlyCost',
  'thirty-day cost': 'monthlyCost',
  'monthly cost': 'monthlyCost',
  'monthly price': 'monthlyCost',
  'cost (30-day)': 'monthlyCost',
  'cost (monthly)': 'monthlyCost',
  cost: 'monthlyCost',

  // --- Preferred Alternative ---
  'preferred alternative': 'preferredAlternative',
  alternative: 'preferredAlternative',
  'formulary alternative': 'preferredAlternative',
  'suggested alternative': 'preferredAlternative',
  'recommended alternative': 'preferredAlternative',
};

/**
 * Given a raw row object from a parsed CSV/XLSX file,
 * resolves the backend field name for any column header using COLUMN_MAPPING.
 */
export const resolveColumnKey = (
  rawColumnHeader: string,
): string | undefined => {
  const normalized = rawColumnHeader.toLowerCase().trim();
  return COLUMN_MAPPING[normalized];
};

/**
 * Parses a cost string (e.g. "$180", "180.00", "$ 30") into a numeric value.
 * Returns 0 if the value cannot be parsed.
 */
export const parseCostValue = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  const numericString = String(value).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
};

export class MedicationNormalizationService {
  static normalizeMedicationName(name: string): string {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }

  static normalizeStrength(strength: string): string {
    if (!strength) return '';
    
    return strength
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  static normalizeRoute(route: string): string {
    if (!route) return '';
    
    const routeMap: Record<string, string> = {
      'po': 'po',
      'oral': 'po',
      'by mouth': 'po',
      'iv': 'iv',
      'intravenous': 'iv',
      'im': 'im',
      'intramuscular': 'im',
      'sc': 'sc',
      'subcutaneous': 'sc',
      'subq': 'sc',
      'pr': 'pr',
      'rectal': 'pr',
      'inhaled': 'inh',
      'inhalation': 'inh',
      'neb': 'neb',
      'nebulized': 'neb',
      'topical': 'top',
      'top': 'top',
      'transdermal': 'td',
      'td': 'td',
      'sl': 'sl',
      'sublingual': 'sl',
    };

    const normalizedRoute = route.toLowerCase().trim();
    return routeMap[normalizedRoute] || normalizedRoute;
  }

  static normalizeFrequency(frequency: string): string {
    if (!frequency) return '';
    
    return frequency
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }
}

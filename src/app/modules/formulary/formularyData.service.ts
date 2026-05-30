import fs from 'fs';
import path from 'path';

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

export class FormularyDataService {
  private static instance: FormularyDataService;
  private preferredFormulary: FormularyEntry[] = [];
  private nonFormulary: FormularyEntry[] = [];
  private deprescribeFormulary: FormularyEntry[] = [];
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): FormularyDataService {
    if (!FormularyDataService.instance) {
      FormularyDataService.instance = new FormularyDataService();
    }
    return FormularyDataService.instance;
  }

  public async loadFormularyData(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    const jsonDir = path.join(__dirname, '../../json');

    try {
      const preferredPath = path.join(jsonDir, 'Preferred (P).json');
      const nonFormularyPath = path.join(jsonDir, 'Non-Formulary (N).json');
      const deprescribePath = path.join(jsonDir, 'Deprescribe (D).json');

      this.preferredFormulary = JSON.parse(
        fs.readFileSync(preferredPath, 'utf8'),
      );
      this.nonFormulary = JSON.parse(fs.readFileSync(nonFormularyPath, 'utf8'));
      this.deprescribeFormulary = JSON.parse(
        fs.readFileSync(deprescribePath, 'utf8'),
      );
      this.isLoaded = true;
      console.log('Formulary data loaded successfully');
    } catch (error) {
      console.error('Error loading formulary data:', error);
      throw error;
    }
  }

  public getPreferredFormulary(): FormularyEntry[] {
    return this.preferredFormulary;
  }

  public getNonFormulary(): FormularyEntry[] {
    return this.nonFormulary;
  }

  public getDeprescribeFormulary(): FormularyEntry[] {
    return this.deprescribeFormulary;
  }

  public getAllFormularyEntries(): {
    preferred: FormularyEntry[];
    nonFormulary: FormularyEntry[];
    deprescribe: FormularyEntry[];
  } {
    return {
      preferred: this.preferredFormulary,
      nonFormulary: this.nonFormulary,
      deprescribe: this.deprescribeFormulary,
    };
  }
}

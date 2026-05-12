import { FormularyDrug } from './formulary.model';
import Medication from '../medication/medication.model';
import { LogService } from '../log/log.service';

const createFormularyDrug = async (payload: any) => {
  const result = await FormularyDrug.create(payload);
  return result;
};

const getAllFormularyDrugs = async () => {
  const result = await FormularyDrug.find();
  return result;
};

const getRecommendationsForPatient = async (patientId: string, organizationId: string) => {
  const medications = await Medication.find({ patientId, organizationId });
  const recommendations = [];

  for (const med of medications) {
    const formularyMed = await FormularyDrug.findOne({
      name: { $regex: med.medicationName, $options: 'i' },
    });

    if (formularyMed && formularyMed.allowedAlternatives.length > 0) {
      const rec = {
        medicationName: med.medicationName,
        currentCost: formularyMed.cost,
        suggestedAlternatives: formularyMed.allowedAlternatives,
        source: 'formulary_db',
        confidence: 1.0,
      };
      recommendations.push(rec);

      // Log recommendation
      await LogService.createLog({
        organizationId: med.organizationId,
        type: 'recommendation',
        details: rec,
        source: 'formulary_db',
        confidence: 1.0,
      });
    }
  }

  return recommendations;
};

export const FormularyService = {
  createFormularyDrug,
  getAllFormularyDrugs,
  getRecommendationsForPatient,
};

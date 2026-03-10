// ── Therapeutic Module ───────────────────────────────────────────────────────

export interface ITherapeutic {
  drugName: string; // The drug to look up (stored lowercase)
  alternative: string; // The suggested alternative drug name
  drugClass: string; // e.g., "Beta Blocker", "ACE Inhibitor"
  estimatedSavings?: number; // Monthly USD savings from switching
  createdAt?: Date;
  updatedAt?: Date;
}

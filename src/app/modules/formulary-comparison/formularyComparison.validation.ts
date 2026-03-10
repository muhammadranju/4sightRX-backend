import { z } from 'zod';

// ─── Analyze ────────────────────────────────────────────────────────────────

export const analyzeSchema = z.object({
  body: z.object({
    medicationIds: z
      .array(z.string().min(1, 'Each medication ID must be a non-empty string'))
      .min(1, 'At least one medication ID is required'),
    // sessionId: z.string().min(1, 'Session ID is required'),
  }),
});

export type AnalyzeInput = z.infer<typeof analyzeSchema>['body'];

// ─── Action Update ───────────────────────────────────────────────────────────

export const actionSchema = z.object({
  body: z.object({
    action: z.enum(['accepted', 'declined', 'discontinued'], {
      message: "Action must be 'accepted', 'declined', or 'discontinued'",
    }),
    acceptNote: z.string().optional(),
    declineReason: z.string().optional(),
    declineNote: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Comparison ID param is required'),
  }),
});

export type ActionInput = z.infer<typeof actionSchema>['body'];

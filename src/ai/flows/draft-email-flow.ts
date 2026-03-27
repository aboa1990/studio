'use server';
/**
 * @fileOverview This flow is deprecated in favor of direct Gmail integration.
 * The file is kept for architectural consistency but is no longer used by the UI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DraftEmailInputSchema = z.object({
  documentType: z.enum(['invoice', 'quotation', 'tender', 'boq', 'letter']),
  documentNumber: z.string(),
  clientName: z.string(),
  totalAmount: z.number().optional(),
  currency: z.string().optional(),
  dueDate: z.string().optional(),
  companyName: z.string(),
  senderEmail: z.string().optional(),
  senderPhone: z.string().optional(),
  documentContent: z.string().optional(),
  customInstructions: z.string().optional(),
});

const DraftEmailOutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

export async function draftEmail(input: any): Promise<any> {
  throw new Error("AI drafting is disabled. Use direct Gmail integration.");
}

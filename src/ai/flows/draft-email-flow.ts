
'use server';
/**
 * @fileOverview A professional email drafting flow for business documents.
 *
 * - draftEmail - A function that generates an email draft based on document context.
 * - DraftEmailInput - The input type for the draftEmail function.
 * - DraftEmailOutput - The return type for the draftEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DraftEmailInputSchema = z.object({
  documentType: z.enum(['invoice', 'quotation', 'tender', 'boq', 'letter']).describe('The type of document being emailed.'),
  documentNumber: z.string().describe('The reference number of the document.'),
  clientName: z.string().describe('The name of the recipient client.'),
  totalAmount: z.number().optional().describe('The total value of the document, if applicable.'),
  currency: z.string().optional().describe('The currency code, e.g., MVR.'),
  dueDate: z.string().optional().describe('The payment or submission deadline.'),
  companyName: z.string().describe('The sender business name.'),
  customInstructions: z.string().optional().describe('Any additional notes to include in the drafting logic.'),
});
export type DraftEmailInput = z.infer<typeof DraftEmailInputSchema>;

const DraftEmailOutputSchema = z.object({
  subject: z.string().describe('The generated email subject line.'),
  body: z.string().describe('The generated email body text.'),
});
export type DraftEmailOutput = z.infer<typeof DraftEmailOutputSchema>;

const prompt = ai.definePrompt({
  name: 'draftEmailPrompt',
  input: { schema: DraftEmailInputSchema },
  output: { schema: DraftEmailOutputSchema },
  prompt: `You are a professional business communications assistant for a company in the Maldives.
Your task is to draft a polite, professional, and clear email for a client regarding a {{documentType}}.

Context:
- Client: {{clientName}}
- Document Ref: {{documentNumber}}
{{#if totalAmount}}
- Total Value: {{currency}} {{totalAmount}}
{{/if}}
{{#if dueDate}}
- Deadline/Due Date: {{dueDate}}
{{/if}}
- Sender: {{companyName}}

Instructions:
1. Ensure the tone is professional yet friendly.
2. If it is an invoice, clearly mention the total and the due date.
3. If it is a quotation or tender, express enthusiasm for the project and offer further assistance.
4. Use standard professional greetings and closings.
5. If custom instructions are provided, incorporate them naturally: {{customInstructions}}

Draft the subject line and the body.`,
});

export async function draftEmail(input: DraftEmailInput): Promise<DraftEmailOutput> {
  const { output } = await prompt(input);
  if (!output) throw new Error('Failed to generate email draft');
  return output;
}

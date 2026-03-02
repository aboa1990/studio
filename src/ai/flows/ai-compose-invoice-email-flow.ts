'use server';
/**
 * @fileOverview This file implements a Genkit flow for composing personalized email content for invoices or quotations.
 *
 * - composeInvoiceEmail - A function that handles the email composition process.
 * - ComposeInvoiceEmailInput - The input type for the composeInvoiceEmail function.
 * - ComposeInvoiceEmailOutput - The return type for the composeInvoiceEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ComposeInvoiceEmailInputSchema = z.object({
  documentType: z.enum(['invoice', 'quotation']).describe('The type of document, either an invoice or a quotation.'),
  clientName: z.string().describe('The name of the client to whom the document is being sent.'),
  documentNumber: z.string().describe('The unique identifier for the invoice or quotation (e.g., "INV-2024-001", "Q-2024-005").'),
  dueDate: z.string().optional().describe('The due date for the invoice, if applicable, in a readable format.'),
  totalAmount: z.number().describe('The total monetary amount of the invoice or quotation.'),
  currency: z.string().default('MVR').describe('The currency used for the total amount, defaults to MVR.'),
  companyName: z.string().describe('The name of the company sending the email.'),
  senderName: z.string().describe('The name of the individual sending the email from the company.'),
  customInstructions: z.string().optional().describe('Any specific instructions or additional details to include in the email.'),
});
export type ComposeInvoiceEmailInput = z.infer<typeof ComposeInvoiceEmailInputSchema>;

const ComposeInvoiceEmailOutputSchema = z.object({
  subject: z.string().describe('The professional and concise subject line for the email.'),
  body: z.string().describe('The polite and professional body of the email. It should greet the client, clearly state the document type and number, mention the total amount, and include the due date if provided. It should also incorporate any custom instructions.'),
});
export type ComposeInvoiceEmailOutput = z.infer<typeof ComposeInvoiceEmailOutputSchema>;

export async function composeInvoiceEmail(input: ComposeInvoiceEmailInput): Promise<ComposeInvoiceEmailOutput> {
  return composeInvoiceEmailFlow(input);
}

const composeInvoiceEmailPrompt = ai.definePrompt({
  name: 'composeInvoiceEmailPrompt',
  input: { schema: ComposeInvoiceEmailInputSchema },
  output: { schema: ComposeInvoiceEmailOutputSchema },
  prompt: `You are a professional email assistant. Your task is to compose a polite and clear email for sending a document to a client.
Ensure the email is concise, professional, and directly addresses the client with all necessary information.

Here are the details for the email:
Document Type: {{{documentType}}}
Client Name: {{{clientName}}}
Document Number: {{{documentNumber}}}
{{#if dueDate}}Due Date: {{{dueDate}}}{{/if}}
Total Amount: {{{totalAmount}}} {{{currency}}}
Company Name: {{{companyName}}}
Sender Name: {{{senderName}}}
{{#if customInstructions}}Additional Instructions: {{{customInstructions}}}{{/if}}

Please generate a JSON object with two fields: 'subject' (for the email subject line) and 'body' (for the email's content). Ensure the output strictly adheres to the provided output schema and includes all relevant details.`,
});

const composeInvoiceEmailFlow = ai.defineFlow(
  {
    name: 'composeInvoiceEmailFlow',
    inputSchema: ComposeInvoiceEmailInputSchema,
    outputSchema: ComposeInvoiceEmailOutputSchema,
  },
  async (input) => {
    const { output } = await composeInvoiceEmailPrompt(input);
    if (!output) {
      throw new Error('Failed to generate email content.');
    }
    return output;
  }
);

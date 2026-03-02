
export type DocumentType = 'invoice' | 'quotation' | 'tender';

export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'rejected' | 'submitted' | 'awarded' | 'lost';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string;
}

export interface Document {
  id: string;
  profileId: string; // Linked to a specific company profile
  type: DocumentType;
  number: string;
  clientName: string;
  clientEmail: string;
  items: LineItem[];
  taxRate: number;
  date: string;
  dueDate?: string;
  status: DocumentStatus;
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  attachments?: Attachment[];
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName?: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  logoUrl?: string;
  signatureUrl?: string;
  authorizedSignatory?: string;
  gstNumber?: string;
  bankDetails?: BankDetails;
}

// Keeping for backward compatibility or singular references if needed
export type CompanyDetails = CompanyProfile;

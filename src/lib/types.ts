
export type DocumentType = 'invoice' | 'quotation' | 'tender' | 'boq';

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

export interface LibraryDocument {
  id: string;
  profileId: string;
  name: string;
  type: string;
  data: string; // Base64 encoded string
  category: string;
  uploadedAt: string;
}

export interface Client {
  id: string;
  profileId: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  notes?: string;
}

export interface Document {
  id: string;
  profileId: string; // Linked to a specific company profile
  type: DocumentType;
  number: string;
  clientId?: string; // Reference to a saved client
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
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

export type CompanyDetails = CompanyProfile;

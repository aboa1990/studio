
export type DocumentType = 'invoice' | 'quotation' | 'tender' | 'boq';

export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'rejected' | 'submitted' | 'awarded' | 'lost';

export interface LineItem {
  id: string;
  costCode?: string;
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
  profile_id: string;
  name: string;
  type: string;
  data: string; // Base64 encoded string
  category: string;
  uploaded_at: string;
}

export interface Client {
  id: string;
  profile_id: string;
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
  profile_id: string; // Linked to a specific company profile
  type: DocumentType;
  number: string;
  client_id?: string; // Reference to a saved client
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
  user_id?: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  logo_url?: string;
  signatureUrl?: string;
  authorizedSignatory?: string;
  gstNumber?: string;
  bankDetails?: BankDetails;
  last_active_at?: string;
}

export type CompanyDetails = CompanyProfile;

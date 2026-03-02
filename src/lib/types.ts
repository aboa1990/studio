
export type DocumentType = 'invoice' | 'quotation';

export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'rejected';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Document {
  id: string;
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
}

export interface CompanyDetails {
  name: string;
  address: string;
  email: string;
  phone: string;
  logoUrl?: string;
  gstNumber?: string;
}

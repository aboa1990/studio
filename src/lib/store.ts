
import { Document, CompanyDetails } from './types';

const STORAGE_KEY_DOCS = 'forgedocs_documents';
const STORAGE_KEY_COMPANY = 'forgedocs_company';

export const getDocuments = (): Document[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY_DOCS);
  return stored ? JSON.parse(stored) : [];
};

export const saveDocument = (doc: Document) => {
  const docs = getDocuments();
  const index = docs.findIndex((d) => d.id === doc.id);
  if (index >= 0) {
    docs[index] = doc;
  } else {
    docs.push(doc);
  }
  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs));
};

export const deleteDocument = (id: string) => {
  const docs = getDocuments();
  const filtered = docs.filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(filtered));
};

export const getCompanyDetails = (): CompanyDetails => {
  if (typeof window === 'undefined') return defaultCompany;
  const stored = localStorage.getItem(STORAGE_KEY_COMPANY);
  return stored ? JSON.parse(stored) : defaultCompany;
};

export const saveCompanyDetails = (details: CompanyDetails) => {
  localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(details));
};

const defaultCompany: CompanyDetails = {
  name: 'ForgeDocs Maldives',
  address: 'H. Mookai Suites, Male, Maldives',
  email: 'hello@forgedocs.mv',
  phone: '+960 333-4444',
  gstNumber: 'GST-123456789',
};

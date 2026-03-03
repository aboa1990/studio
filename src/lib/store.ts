
import { supabase } from './supabase';
import { Client, CompanyProfile, Document, LibraryDocument } from './types';

// --- Profile Management ---

export const getActiveProfileId = async (): Promise<string> => {
  const { data, error } = await supabase.from('company_profiles').select('id').limit(1);
  if (error) throw error;
  if (data && data.length > 0) {
    return data[0].id;
  }
  throw new Error("No company profile found.");
};

export const getProfiles = async (): Promise<CompanyProfile[]> => {
  const { data, error } = await supabase.from('company_profiles').select('*');
  if (error) throw error;
  return data;
};

export const getProfile = async (id: string): Promise<CompanyProfile | null> => {
    const { data, error } = await supabase.from('company_profiles').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
};

export const saveProfile = async (profile: CompanyProfile): Promise<CompanyProfile> => {
  const { data, error } = await supabase.from('company_profiles').upsert(profile).select();
  if (error) throw error;
  return data[0];
};


// --- Client Management ---

export const getClients = async (): Promise<Client[]> => {
  const profileId = await getActiveProfileId();
  if (!profileId) return [];
  const { data, error } = await supabase.from('clients').select('*').eq('profileId', profileId);
  if (error) throw error;
  return data;
};

export const getClient = async (id: string): Promise<Client | null> => {
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching client:', error);
        return null;
    }
    return data;
};

export const saveClient = async (client: Client): Promise<Client> => {
  const { data, error } = await supabase.from('clients').upsert(client).select();
  if (error) throw error;
  return data[0];
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
};


// --- Document Management (Invoices, Quotations, Tenders) ---

export const getDocuments = async (): Promise<Document[]> => {
  const profileId = await getActiveProfileId();
  if (!profileId) return [];
  const { data, error } = await supabase.from('documents').select('*').eq('profileId', profileId);
  if (error) throw error;
  return data;
};

export const getDocument = async (id: string): Promise<Document | null> => {
    const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching document:', error);
        return null;
    }
    return data;
};

export const saveDocument = async (doc: Document): Promise<Document> => {
  const { data, error } = await supabase.from('documents').upsert(doc).select();
  if (error) throw error;
  return data[0];
};

export const deleteDocument = async (id: string): Promise<void> => {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw error;
};

// --- Document Library Management ---

export const getLibraryDocuments = async (): Promise<LibraryDocument[]> => {
  const profileId = await getActiveProfileId();
  if (!profileId) return [];
  const { data, error } = await supabase.from('library_documents').select('*').eq('profileId', profileId);
  if (error) throw error;
  return data;
};

export const saveLibraryDocument = async (doc: LibraryDocument): Promise<LibraryDocument> => {
    const { data, error } = await supabase.from('library_documents').upsert(doc).select();
    if (error) throw error;
    return data[0];
};

export const deleteLibraryDocument = async (id: string): Promise<void> => {
    const { error } = await supabase.from('library_documents').delete().eq('id', id);
    if (error) throw error;
};

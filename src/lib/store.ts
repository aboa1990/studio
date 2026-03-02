
import { Document, CompanyProfile, Client, LibraryDocument } from './types';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

const PROFILES_COLLECTION = 'profiles';
const DOCUMENTS_COLLECTION = 'documents';
const CLIENTS_COLLECTION = 'clients';
const LIBRARY_COLLECTION = 'library';

const STORAGE_KEY_ACTIVE_PROFILE_ID = 'forgedocs_active_profile_id';

const defaultProfileId = 'default-profile-1';

export const getProfiles = async (): Promise<CompanyProfile[]> => {
  const { data, error } = await supabase.from(PROFILES_COLLECTION).select('*');
  if (error) throw error;
  return data || [];
};

export const saveProfile = async (profile: CompanyProfile) => {
  const { error } = await supabase.from(PROFILES_COLLECTION).upsert(profile);
  if (error) throw error;
};

export const deleteProfile = async (id: string) => {
  const { error } = await supabase.from(PROFILES_COLLECTION).delete().match({ id });
  if (error) throw error;
};

export const getActiveProfileId = async (): Promise<string> => {
  if (typeof window === 'undefined') return Promise.resolve(defaultProfileId);
  const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE_ID);
  return Promise.resolve(activeId || defaultProfileId);
};

export const setActiveProfileId = (id: string) => {
  localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, id);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('profileChanged'));
  }
};

export const getActiveProfile = async (): Promise<CompanyProfile> => {
  const activeId = await getActiveProfileId();
  const { data, error } = await supabase.from(PROFILES_COLLECTION).select('*').eq('id', activeId).single();
  if (error) {
    const profiles = await getProfiles();
    return profiles[0];
  }
  return data;
};

export const getDocuments = async (): Promise<Document[]> => {
  const activeId = await getActiveProfileId();
  const { data, error } = await supabase.from(DOCUMENTS_COLLECTION).select('*').eq('profileId', activeId);
  if (error) throw error;
  return data || [];
};

export const getDocument = async (id: string): Promise<Document | null> => {
  const { data, error } = await supabase.from(DOCUMENTS_COLLECTION).select('*').eq('id', id).single();
  if (error) return null;
  return data;
};

export const saveDocument = async (docData: Partial<Document>) => {
  const activeId = await getActiveProfileId();
  const id = docData.id || uuidv4();
  const docToSave = { ...docData, id, profileId: activeId };
  const { data, error } = await supabase.from(DOCUMENTS_COLLECTION).upsert(docToSave).select();
  if (error) throw error;
  return data?.[0] as Document;
};

export const deleteDocument = async (id: string) => {
  const { error } = await supabase.from(DOCUMENTS_COLLECTION).delete().match({ id });
  if (error) throw error;
};

export const getClients = async (): Promise<Client[]> => {
  const activeId = await getActiveProfileId();
  const { data, error } = await supabase.from(CLIENTS_COLLECTION).select('*').eq('profileId', activeId);
  if (error) throw error;
  return data || [];
};

export const saveClient = async (clientData: Client) => {
  const activeId = await getActiveProfileId();
  const id = clientData.id || uuidv4();
  const clientToSave = { ...clientData, id, profileId: activeId };
  const { data, error } = await supabase.from(CLIENTS_COLLECTION).upsert(clientToSave).select();
  if (error) throw error;
  return data?.[0];
};

export const deleteClient = async (id: string) => {
  const { error } = await supabase.from(CLIENTS_COLLECTION).delete().match({ id });
  if (error) throw error;
};

export const getLibraryDocuments = async (): Promise<LibraryDocument[]> => {
  const activeId = await getActiveProfileId();
  const { data, error } = await supabase.from(LIBRARY_COLLECTION).select('*').eq('profileId', activeId);
  if (error) throw error;
  return data || [];
};

export const saveLibraryDocument = async (docData: Omit<LibraryDocument, 'id'>) => {
  const activeId = await getActiveProfileId();
  const id = uuidv4();
  const docToSave: LibraryDocument = { ...docData, id, profileId: activeId };
  const { data, error } = await supabase.from(LIBRARY_COLLECTION).insert(docToSave).select();
  if (error) throw error;
  return data?.[0];
};

export const deleteLibraryDocument = async (id: string) => {
  const { error } = await supabase.from(LIBRARY_COLLECTION).delete().match({ id });
  if (error) throw error;
};

export const getCompanyDetails = getActiveProfile;
export const saveCompanyDetails = saveProfile;

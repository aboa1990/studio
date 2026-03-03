
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
  if (error) throw new Error(error.message || 'Failed to fetch profiles');
  return data || [];
};

export const saveProfile = async (profile: CompanyProfile) => {
  const { error } = await supabase.from(PROFILES_COLLECTION).upsert(profile);
  if (error) throw new Error(error.message || 'Failed to save profile');
};

export const deleteProfile = async (id: string) => {
  const { error } = await supabase.from(PROFILES_COLLECTION).delete().match({ id });
  if (error) throw new Error(error.message || 'Failed to delete profile');
};

export const getActiveProfileId = async (): Promise<string> => {
  if (typeof window === 'undefined') return defaultProfileId;
  const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE_ID);
  return activeId || defaultProfileId;
};

export const setActiveProfileId = (id: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, id);
  window.dispatchEvent(new Event('profileChanged'));
};

export const getActiveProfile = async (): Promise<CompanyProfile> => {
  try {
    const activeId = await getActiveProfileId();
    const { data, error } = await supabase.from(PROFILES_COLLECTION).select('*').eq('id', activeId).single();
    if (error) {
      const profiles = await getProfiles();
      if (profiles.length === 0) {
          // Create a default profile if none exists
          const newId = uuidv4();
          const defaultProfile: CompanyProfile = {
              id: newId,
              name: "My Company",
              address: "Male', Maldives",
              email: "info@company.mv",
              phone: "7770000",
              bankDetails: { bankName: "", accountName: "", accountNumber: "", branchName: "" }
          };
          await saveProfile(defaultProfile);
          setActiveProfileId(newId);
          return defaultProfile;
      }
      return profiles[0];
    }
    return data;
  } catch (err) {
    const profiles = await getProfiles();
    return profiles[0];
  }
};

export const getDocuments = async (): Promise<Document[]> => {
  const activeId = await getActiveProfileId();
  const { data, error } = await supabase.from(DOCUMENTS_COLLECTION).select('*').eq('profileId', activeId);
  if (error) throw new Error(error.message || 'Failed to fetch documents');
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
  if (error) throw new Error(error.message || 'Failed to save document');
  return data?.[0] as Document;
};

export const deleteDocument = async (id: string) => {
  const { error } = await supabase.from(DOCUMENTS_COLLECTION).delete().match({ id });
  if (error) throw new Error(error.message || 'Failed to delete document');
};

export const getClients = async (): Promise<Client[]> => {
  const activeId = await getActiveProfileId();
  const { data, error } = await supabase.from(CLIENTS_COLLECTION).select('*').eq('profileId', activeId);
  if (error) throw new Error(error.message || 'Failed to fetch clients');
  return data || [];
};

export const saveClient = async (clientData: Client) => {
  const activeId = await getActiveProfileId();
  const id = clientData.id || uuidv4();
  const clientToSave = { ...clientData, id, profileId: activeId };
  const { data, error } = await supabase.from(CLIENTS_COLLECTION).upsert(clientToSave).select();
  if (error) throw new Error(error.message || 'Failed to save client');
  return data?.[0];
};

export const deleteClient = async (id: string) => {
  const { error } = await supabase.from(CLIENTS_COLLECTION).delete().match({ id });
  if (error) throw new Error(error.message || 'Failed to delete client');
};

export const getLibraryDocuments = async (): Promise<LibraryDocument[]> => {
  const activeId = await getActiveProfileId();
  const { data, error } = await supabase.from(LIBRARY_COLLECTION).select('*').eq('profileId', activeId);
  if (error) throw new Error(error.message || 'Failed to fetch library documents');
  return data || [];
};

export const saveLibraryDocument = async (docData: Omit<LibraryDocument, 'id'>) => {
  const activeId = await getActiveProfileId();
  const id = uuidv4();
  const docToSave: LibraryDocument = { ...docData, id, profileId: activeId };
  const { data, error } = await supabase.from(LIBRARY_COLLECTION).insert(docToSave).select();
  if (error) throw new Error(error.message || 'Failed to save library document');
  return data?.[0];
};

export const deleteLibraryDocument = async (id: string) => {
  const { error } = await supabase.from(LIBRARY_COLLECTION).delete().match({ id });
  if (error) throw new Error(error.message || 'Failed to delete library document');
};

export const getCompanyDetails = getActiveProfile;
export const saveCompanyDetails = saveProfile;

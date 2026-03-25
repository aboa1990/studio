
'use client';

import { create } from 'zustand';
import { supabase } from './supabase';
import { CompanyProfile, Document, DocumentType, Client, LibraryDocument } from './types';

interface StoreState {
  profiles: CompanyProfile[];
  currentProfile: CompanyProfile | null;
  loading: boolean;
  setProfiles: (profiles: CompanyProfile[]) => void;
  setCurrentProfile: (profile: CompanyProfile | null) => void;
  fetchProfiles: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  profiles: [],
  currentProfile: null,
  loading: true,
  setProfiles: (profiles) => set({ profiles }),
  setCurrentProfile: (profile) => {
    if (profile) {
      localStorage.setItem('currentProfileId', profile.id);
    }
    set({ currentProfile: profile });
  },
  fetchProfiles: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      set({ profiles: data || [], loading: false });

      if (data && data.length > 0) {
        const lastProfileId = localStorage.getItem('currentProfileId');
        const profileToSet = data.find(p => p.id === lastProfileId) || data[0];
        get().setCurrentProfile(profileToSet);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      set({ loading: false });
    }
  },
}));

export const getActiveProfileId = async () => {
  const profile = useStore.getState().currentProfile;
  if (profile) return profile.id;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('company_profiles')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single();
    
  return data?.id || null;
}

export async function getDocument(id: string, type: DocumentType): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('type', type)
    .single();
    
  if (error) return null;
  return data;
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return null;
  return data;
}

export async function getDocuments(type?: DocumentType): Promise<Document[]> {
  const activeId = await getActiveProfileId();
  if (!activeId) return [];

  let query = supabase.from('documents').select('*').eq('profile_id', activeId);
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query.order('date', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function saveDocument(document: Document) {
  const { data, error } = await supabase
    .from('documents')
    .upsert(document)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateDocument(id: string, data: Partial<Document>) {
  const { error } = await supabase
    .from('documents')
    .update(data)
    .eq('id', id);
    
  return !error;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);
    
  return !error;
}

export async function getClients(): Promise<Client[]> {
  const activeId = await getActiveProfileId();
  if (!activeId) return [];

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('profile_id', activeId);
    
  if (error) return [];
  return data || [];
}

export async function getLibraryDocuments(): Promise<LibraryDocument[]> {
  const activeId = await getActiveProfileId();
  if (!activeId) return [];

  const { data, error } = await supabase
    .from('library_documents')
    .select('*')
    .eq('profile_id', activeId);
    
  if (error) return [];
  return data || [];
}

export async function saveLibraryDocument(libDoc: LibraryDocument) {
  const { data, error } = await supabase
    .from('library_documents')
    .upsert(libDoc)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteLibraryDocument(id: string) {
  const { error } = await supabase
    .from('library_documents')
    .delete()
    .eq('id', id);
    
  return !error;
}

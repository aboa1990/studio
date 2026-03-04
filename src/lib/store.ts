
import { create } from 'zustand'
import { supabase } from './supabase'
import { CompanyProfile, Document, DocumentType, Client, LibraryDocument } from './types'

interface StoreState {
  profiles: CompanyProfile[];
  currentProfile: CompanyProfile | null;
  setProfiles: (profiles: CompanyProfile[]) => void;
  setCurrentProfile: (profile: CompanyProfile | null) => void;
  fetchProfiles: () => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  profiles: [],
  currentProfile: null,
  setProfiles: (profiles) => set({ profiles }),
  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  fetchProfiles: async () => {
    const { data: profiles, error } = await supabase.from('company_profiles').select('*');
    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }
    set({ profiles: profiles || [] });
    if (profiles && profiles.length > 0) {
        // Check for a previously selected profile ID in local storage
        const lastProfileId = localStorage.getItem('currentProfileId');
        const profileToSet = profiles.find(p => p.id === lastProfileId) || profiles[0];
        set({ currentProfile: profileToSet });
    }
  },
}));

// When the current profile changes, store its ID in local storage.
useStore.subscribe(
    (state) => state.currentProfile,
    (currentProfile) => {
        if (currentProfile) {
            localStorage.setItem('currentProfileId', currentProfile.id);
        }
    }
)

export const getActiveProfileId = () => {
    return useStore.getState().currentProfile?.id;
}

export async function getDocument(id: string, type: DocumentType): Promise<Document | null> {
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('type', type)
        .single();
    if (error) {
        console.error(`Error fetching ${type}:`, error);
        return null;
    }
    return data;
}

export async function getDocuments(type: DocumentType): Promise<Document[]> {
    const profileId = getActiveProfileId();
    if (!profileId) return [];
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('type', type)
        .eq('profileId', profileId);
    if (error) {
        console.error(`Error fetching ${type}s:`, error);
        return [];
    }
    return data || [];
}

export async function saveDocument(document: Document) {
    const { data, error } = await supabase.from('documents').upsert(document).select().single();
    if (error) {
        console.error('Error saving document:', error);
        return null;
    }
    return data;
}

export async function deleteDocument(id: string) {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) {
        console.error('Error deleting document:', error);
    }
}

export async function getClients(): Promise<Client[]> {
    const profileId = getActiveProfileId();
    if (!profileId) return [];
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('profileId', profileId);

    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }
    return data || [];
}

export async function getLibraryDocuments(): Promise<LibraryDocument[]> {
    const profileId = getActiveProfileId();
    if (!profileId) return [];

    const { data, error } = await supabase
        .from('library_documents')
        .select('*')
        .eq('profileId', profileId);
    if (error) {
        console.error('Error fetching library documents:', error);
        return [];
    }
    return data || [];
}

export async function saveLibraryDocument(doc: LibraryDocument) {
    const { data, error } = await supabase.from('library_documents').upsert(doc).select().single();
    if (error) {
        console.error('Error saving library document:', error);
        return null;
    }
    return data;
}

export async function deleteLibraryDocument(id: string) {
    const { error } = await supabase.from('library_documents').delete().eq('id', id);
    if (error) {
        console.error('Error deleting library document:', error);
    }
}

export const getCompanyDetails = (profileId: string): CompanyProfile | undefined => {
    return useStore.getState().profiles.find(p => p.id === profileId);
}

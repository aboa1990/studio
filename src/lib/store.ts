
import { create } from 'zustand';
import { supabase } from './supabase';
import { CompanyProfile, Document, DocumentType, Client, LibraryDocument } from './types';

// Utility to get active profile ID from local storage
const getActiveProfileId = () => {
    if (typeof window !== 'undefined') {
        const id = localStorage.getItem('activeProfileId');
        return id === 'undefined' ? null : id;
    }
    return null;
}

// Utility to set active profile ID in local storage
const setActiveProfileId = (id: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('activeProfileId', id);
    }
}

interface AppState {
    profiles: CompanyProfile[];
    currentProfile: CompanyProfile | null;
    documents: Document[];
    clients: Client[];
    libraryDocuments: LibraryDocument[];
    fetchProfiles: () => Promise<void>;
    setCurrentProfile: (profile: CompanyProfile | null) => void;
    fetchDocuments: (type: DocumentType) => Promise<void>;
    fetchClients: () => Promise<void>;
    fetchLibraryDocuments: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    profiles: [],
    currentProfile: null,
    documents: [],
    clients: [],
    libraryDocuments: [],

    fetchProfiles: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('company_profiles')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            console.error("Error fetching profiles:", error);
            return;
        }

        set({ profiles: data || [] });
        const activeProfileId = getActiveProfileId();
        if (activeProfileId) {
            const activeProfile = data?.find(p => p.id === activeProfileId) || null;
            set({ currentProfile: activeProfile });
        } else if (data && data.length > 0) {
            set({ currentProfile: data[0] });
            setActiveProfileId(data[0].id);
        }
    },

    setCurrentProfile: (profile: CompanyProfile | null) => {
        set({ currentProfile: profile });
        if (profile) {
            setActiveProfileId(profile.id);
        }
    },

    fetchDocuments: async (type: DocumentType) => {
        const profileId = getActiveProfileId();
        if (!profileId) return;
        const docs = await getDocuments(type, profileId);
        set({ documents: docs });
    },

    fetchClients: async () => {
        const profileId = getActiveProfileId();
        if (!profileId) return;
        const clients = await getClients(profileId);
        set({ clients });
    },

    fetchLibraryDocuments: async () => {
        const profileId = getActiveProfileId();
        if (!profileId) return;
        const libraryDocs = await getLibraryDocuments(profileId);
        set({ libraryDocuments: libraryDocs });
    }
}));

// Standalone fetch functions
export async function getDocuments(type: DocumentType, profileId: string): Promise<Document[]> {
    if (!profileId || profileId === 'undefined') return [];
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('type', type)
        .eq('profile_id', profileId);
    if (error) {
        console.error(`Error fetching ${type}s:`, error);
        return [];
    }
    return data || [];
}

export async function getDocument(id: string, type: DocumentType): Promise<Document | null> {
    if (!type) {
        console.error("getDocument requires a document type.");
        return null;
    }
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

export async function saveDocument(document: Partial<Document>): Promise<Document | null> {
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

export async function getClients(profileId: string): Promise<Client[]> {
    if (!profileId || profileId === 'undefined') return [];
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('profile_id', profileId);

    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }
    return data || [];
}

export async function getLibraryDocuments(profileId: string): Promise<LibraryDocument[]> {
    if (!profileId || profileId === 'undefined') return [];
    const { data, error } = await supabase
        .from('library_documents')
        .select('*')
        .eq('profile_id', profileId);
    if (error) {
        console.error('Error fetching library documents:', error);
        return [];
    }
    return data || [];
}

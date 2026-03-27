
'use client';

import { create } from 'zustand';
import { CompanyProfile, Document, DocumentType, Client, LibraryDocument } from './types';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  orderBy,
  limit
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

const { firestore, auth } = initializeFirebase();

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
      const user = auth.currentUser;
      if (!user) {
        set({ loading: false });
        return;
      }

      const q = query(collection(firestore, 'company_profiles'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CompanyProfile));

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

// Initialize profiles when auth state changes
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      useStore.getState().fetchProfiles();
    } else {
      useStore.setState({ profiles: [], currentProfile: null });
    }
  });
}

export const getActiveProfileId = async () => {
  const profile = useStore.getState().currentProfile;
  if (profile) return profile.id;
  
  const user = auth.currentUser;
  if (!user) return null;

  const q = query(collection(firestore, 'company_profiles'), where('user_id', '==', user.uid), limit(1));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty ? null : querySnapshot.docs[0].id;
}

export async function getDocument(id: string, type: DocumentType): Promise<Document | null> {
  const docRef = doc(firestore, 'documents', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  const data = docSnap.data() as Document;
  if (data.type !== type) return null;
  return { ...data, id: docSnap.id };
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const docRef = doc(firestore, 'documents', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  return { ...docSnap.data(), id: docSnap.id } as Document;
}

export async function getDocuments(type?: DocumentType): Promise<Document[]> {
  const activeId = await getActiveProfileId();
  if (!activeId) return [];

  let q = query(collection(firestore, 'documents'), where('profile_id', '==', activeId));
  if (type) {
    q = query(q, where('type', '==', type));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Document))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveDocument(document: Document) {
  const docRef = doc(firestore, 'documents', document.id);
  await setDoc(docRef, document);
  return document;
}

export async function updateDocument(id: string, data: Partial<Document>) {
  const docRef = doc(firestore, 'documents', id);
  try {
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function deleteDocument(id: string) {
  const docRef = doc(firestore, 'documents', id);
  try {
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getClients(): Promise<Client[]> {
  const activeId = await getActiveProfileId();
  if (!activeId) return [];

  const q = query(collection(firestore, 'clients'), where('profile_id', '==', activeId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client));
}

export async function getLibraryDocuments(): Promise<LibraryDocument[]> {
  const activeId = await getActiveProfileId();
  if (!activeId) return [];

  const q = query(collection(firestore, 'library_documents'), where('profile_id', '==', activeId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LibraryDocument));
}

export async function saveLibraryDocument(libDoc: LibraryDocument) {
  const docRef = doc(firestore, 'library_documents', libDoc.id);
  await setDoc(docRef, libDoc);
  return libDoc;
}

export async function deleteLibraryDocument(id: string) {
  const docRef = doc(firestore, 'library_documents', id);
  try {
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

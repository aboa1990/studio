
'use client';

import { create } from 'zustand';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { CompanyProfile, Document, DocumentType, Client, LibraryDocument } from './types';

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
  setCurrentProfile: async (profile) => {
    if (profile) {
      const profileRef = doc(firestore, 'companies', profile.id);
      updateDoc(profileRef, { 
        last_active_at: new Date().toISOString() 
      }).catch(console.error);
      localStorage.setItem('currentProfileId', profile.id);
    }
    set({ currentProfile: profile });
  },
  fetchProfiles: async () => {
    set({ loading: true });
    const user = auth.currentUser;
    if (!user) {
      set({ loading: false });
      return;
    }

    try {
      const q = query(collection(firestore, 'companies'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const profilesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompanyProfile));
      
      set({ profiles: profilesData, loading: false });

      if (profilesData.length > 0) {
        const lastProfileId = localStorage.getItem('currentProfileId');
        let profileToSet = profilesData.find(p => p.id === lastProfileId);

        if (!profileToSet) {
          profileToSet = profilesData.sort((a, b) => 
            new Date(b.last_active_at || 0).getTime() - new Date(a.last_active_at || 0).getTime()
          )[0];
        }
        
        get().setCurrentProfile(profileToSet);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      set({ loading: false });
    }
  },
}));

// Initialize auth listener
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      useStore.getState().fetchProfiles();
    } else {
      useStore.setState({ profiles: [], currentProfile: null, loading: false });
    }
  });
}

export const getActiveProfileId = () => {
  return useStore.getState().currentProfile?.id;
}

export async function getDocument(id: string, type: DocumentType): Promise<Document | null> {
  const profileId = getActiveProfileId();
  if (!profileId) return null;
  
  const docRef = doc(firestore, 'companies', profileId, 'documents', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Document;
  }
  return null;
}

export async function getDocuments(type?: DocumentType): Promise<Document[]> {
  const profileId = getActiveProfileId();
  if (!profileId) return [];
  
  const docsRef = collection(firestore, 'companies', profileId, 'documents');
  let q = query(docsRef, orderBy('date', 'desc'));
  
  if (type) {
    q = query(docsRef, where('type', '==', type), orderBy('date', 'desc'));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
}

export async function saveDocument(document: Document) {
  const profileId = getActiveProfileId();
  if (!profileId) return null;

  const docRef = doc(firestore, 'companies', profileId, 'documents', document.id);
  await setDoc(docRef, {
    ...document,
    updatedAt: serverTimestamp()
  }, { merge: true });
  
  return document;
}

export async function updateDocument(id: string, data: Partial<Document>) {
    const profileId = getActiveProfileId();
    if (!profileId) return false;

    const docRef = doc(firestore, 'companies', profileId, 'documents', id);
    try {
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

export async function deleteDocument(id: string) {
  const profileId = getActiveProfileId();
  if (!profileId) return;

  const docRef = doc(firestore, 'companies', profileId, 'documents', id);
  await deleteDoc(docRef);
}

export async function getClients(): Promise<Client[]> {
  const profileId = getActiveProfileId();
  if (!profileId) return [];
  
  const clientsRef = collection(firestore, 'companies', profileId, 'clients');
  const querySnapshot = await getDocs(clientsRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
}

export async function getLibraryDocuments(): Promise<LibraryDocument[]> {
  const profileId = getActiveProfileId();
  if (!profileId) return [];

  const libRef = collection(firestore, 'companies', profileId, 'library');
  const querySnapshot = await getDocs(libRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LibraryDocument));
}

export async function saveLibraryDocument(libDoc: LibraryDocument) {
  const profileId = getActiveProfileId();
  if (!profileId) return null;

  const docRef = doc(firestore, 'companies', profileId, 'library', libDoc.id);
  await setDoc(docRef, libDoc);
  return libDoc;
}

export async function deleteLibraryDocument(id: string) {
  const profileId = getActiveProfileId();
  if (!profileId) return;

  const docRef = doc(firestore, 'companies', profileId, 'library', id);
  await deleteDoc(docRef);
}

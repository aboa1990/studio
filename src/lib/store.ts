
'use client';

import { create } from 'zustand';
import { CompanyProfile, Document, DocumentType, Client, LibraryDocument, Expense } from './types';
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
  limit,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

      const q = query(collection(firestore, 'companies'), where('ownerUserId', '==', user.uid));
      const querySnapshot = await getDocs(q).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'companies',
          operation: 'list'
        }));
        throw err;
      });
      
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

  const q = query(collection(firestore, 'companies'), where('ownerUserId', '==', user.uid), limit(1));
  const querySnapshot = await getDocs(q).catch(() => ({ empty: true, docs: [] }));
  return querySnapshot.empty ? null : querySnapshot.docs[0].id;
}

export async function getDocument(id: string, type: DocumentType): Promise<Document | null> {
  const activeId = await getActiveProfileId();
  if (!activeId) return null;

  const docRef = doc(firestore, 'companies', activeId, 'documents', id);
  const docSnap = await getDoc(docRef).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'get'
    }));
    return null;
  });
  
  if (!docSnap || !docSnap.exists()) return null;
  const data = docSnap.data() as Document;
  if (data.type !== type) return null;
  return { ...data, id: docSnap.id };
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const activeId = await getActiveProfileId();
  if (!activeId) return null;

  const docRef = doc(firestore, 'companies', activeId, 'documents', id);
  const docSnap = await getDoc(docRef).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'get'
    }));
    return null;
  });
  
  if (!docSnap || !docSnap.exists()) return null;
  return { ...docSnap.data(), id: docSnap.id } as Document;
}

export async function getDocuments(type?: DocumentType): Promise<Document[]> {
  const activeId = await getActiveProfileId();
  if (!activeId) return [];

  const colRef = collection(firestore, 'companies', activeId, 'documents');
  const q = type ? query(colRef, where('type', '==', type)) : colRef;
  
  const querySnapshot = await getDocs(q).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: `companies/${activeId}/documents`,
      operation: 'list'
    }));
    return { docs: [] } as any;
  });

  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Document))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveDocument(document: Document) {
  const activeId = document.profile_id || await getActiveProfileId();
  if (!activeId) throw new Error("No active profile ID found");

  const docRef = doc(firestore, 'companies', activeId, 'documents', document.id);
  
  const dataToSave = { 
    ...document, 
    profile_id: activeId,
    createdByUserId: auth.currentUser?.uid,
    updatedAt: serverTimestamp(),
    createdAt: document.date || new Date().toISOString()
  };

  await setDoc(docRef, dataToSave, { merge: true })
    .catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: dataToSave
      }));
      throw err;
    });
    
  return document;
}

export async function updateDocument(id: string, data: Partial<Document>) {
  const activeId = await getActiveProfileId();
  if (!activeId) return false;

  const docRef = doc(firestore, 'companies', activeId, 'documents', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
    .catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data
      }));
    });
  return true;
}

export async function deleteDocument(id: string) {
  const activeId = await getActiveProfileId();
  if (!activeId) return false;

  const docRef = doc(firestore, 'companies', activeId, 'documents', id);
  await deleteDoc(docRef)
    .catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });
  return true;
}

export async function getClients(): Promise<Client[]> {
  const activeId = await getActiveProfileId();
  if (!activeId) return [];

  const colRef = collection(firestore, 'companies', activeId, 'clients');
  const querySnapshot = await getDocs(colRef).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: colRef.path,
      operation: 'list'
    }));
    return { docs: [] } as any;
  });
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client));
}

export async function getLibraryDocuments(): Promise<LibraryDocument[]> {
  const activeId = await getActiveProfileId();
  if (!activeId) return [];

  const colRef = collection(firestore, 'library_documents');
  const q = query(colRef, where('profile_id', '==', activeId));
  const querySnapshot = await getDocs(q).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: colRef.path,
      operation: 'list'
    }));
    return { docs: [] } as any;
  });
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LibraryDocument));
}

export async function saveLibraryDocument(libDoc: LibraryDocument) {
  const docRef = doc(firestore, 'library_documents', libDoc.id);
  await setDoc(docRef, libDoc, { merge: true }).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'write',
      requestResourceData: libDoc
    }));
  });
  return libDoc;
}

export async function deleteLibraryDocument(id: string) {
  const docRef = doc(firestore, 'library_documents', id);
  await deleteDoc(docRef).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete'
    }));
  });
  return true;
}

// Expense Management
export async function getExpenses(): Promise<Expense[]> {
  const activeId = await getActiveProfileId();
  if (!activeId) return [];

  const colRef = collection(firestore, 'companies', activeId, 'expenses');
  const q = query(colRef, orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: `companies/${activeId}/expenses`,
      operation: 'list'
    }));
    return { docs: [] } as any;
  });
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Expense));
}

export async function saveExpense(expense: Expense) {
  const activeId = await getActiveProfileId();
  if (!activeId) throw new Error("No active profile ID");

  const docRef = doc(firestore, 'companies', activeId, 'expenses', expense.id);
  const dataToSave = {
    ...expense,
    profile_id: activeId,
    updatedAt: serverTimestamp(),
    createdAt: expense.createdAt || serverTimestamp()
  };

  await setDoc(docRef, dataToSave, { merge: true }).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'write',
      requestResourceData: dataToSave
    }));
    throw err;
  });
  return expense;
}

export async function deleteExpense(id: string) {
  const activeId = await getActiveProfileId();
  if (!activeId) return false;

  const docRef = doc(firestore, 'companies', activeId, 'expenses', id);
  await deleteDoc(docRef).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete'
    }));
  });
  return true;
}

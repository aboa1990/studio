'use client';

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { Document, CompanyProfile, Client, LibraryDocument } from './types';
import { v4 as uuidv4 } from 'uuid';

const { firestore: db, auth } = initializeFirebase();

const COMPANIES_COLLECTION = 'companies';
const STORAGE_KEY_ACTIVE_PROFILE_ID = 'forgedocs_active_profile_id';
const defaultProfileId = 'default-profile-1';

// Helper to ensure user profile is synced with the active company
const syncUserProfile = async (companyId: string) => {
  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { 
      companyProfileId: companyId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
};

// --- Profile Management ---

export const getProfiles = async (): Promise<CompanyProfile[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COMPANIES_COLLECTION));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CompanyProfile));
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
};

export const saveProfile = async (profile: CompanyProfile) => {
  const docRef = doc(db, COMPANIES_COLLECTION, profile.id);
  await setDoc(docRef, profile, { merge: true });
  // If we're updating a profile, ensure the user's membership is synced
  await syncUserProfile(profile.id);
};

export const deleteProfile = async (id: string) => {
  await deleteDoc(doc(db, COMPANIES_COLLECTION, id));
};

export const getActiveProfileId = async (): Promise<string> => {
  if (typeof window === 'undefined') return defaultProfileId;
  return localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE_ID) || defaultProfileId;
};

export const setActiveProfileId = async (id: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, id);
  await syncUserProfile(id);
  window.dispatchEvent(new Event('profileChanged'));
};

export const getActiveProfile = async (): Promise<CompanyProfile> => {
  const activeId = await getActiveProfileId();
  const docRef = doc(db, COMPANIES_COLLECTION, activeId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as CompanyProfile;
  }

  // Fallback to first available or create default
  const profiles = await getProfiles();
  if (profiles.length > 0) {
    await setActiveProfileId(profiles[0].id);
    return profiles[0];
  }

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
  await setActiveProfileId(newId);
  return defaultProfile;
};

// --- Document Management ---

export const getDocuments = async (): Promise<Document[]> => {
  const activeId = await getActiveProfileId();
  const querySnapshot = await getDocs(collection(db, COMPANIES_COLLECTION, activeId, 'documents'));
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Document));
};

export const getDocument = async (id: string): Promise<Document | null> => {
  const activeId = await getActiveProfileId();
  const docRef = doc(db, COMPANIES_COLLECTION, activeId, 'documents', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ ...docSnap.data(), id: docSnap.id } as Document) : null;
};

export const saveDocument = async (docData: Partial<Document>) => {
  const activeId = await getActiveProfileId();
  const id = docData.id || uuidv4();
  const docRef = doc(db, COMPANIES_COLLECTION, activeId, 'documents', id);
  const data = { 
    ...docData, 
    id, 
    profileId: activeId,
    userId: auth.currentUser?.uid || 'anonymous'
  };
  await setDoc(docRef, data, { merge: true });
  return data as Document;
};

export const deleteDocument = async (id: string) => {
  const activeId = await getActiveProfileId();
  await deleteDoc(doc(db, COMPANIES_COLLECTION, activeId, 'documents', id));
};

// --- Client Management ---

export const getClients = async (): Promise<Client[]> => {
  const activeId = await getActiveProfileId();
  const querySnapshot = await getDocs(collection(db, COMPANIES_COLLECTION, activeId, 'clients'));
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client));
};

export const saveClient = async (clientData: Client) => {
  const activeId = await getActiveProfileId();
  const id = clientData.id || uuidv4();
  const docRef = doc(db, COMPANIES_COLLECTION, activeId, 'clients', id);
  await setDoc(docRef, { ...clientData, id, profileId: activeId }, { merge: true });
  return { ...clientData, id, profileId: activeId };
};

export const deleteClient = async (id: string) => {
  const activeId = await getActiveProfileId();
  await deleteDoc(doc(db, COMPANIES_COLLECTION, activeId, 'clients', id));
};

// --- Library Management ---

export const getLibraryDocuments = async (): Promise<LibraryDocument[]> => {
  const activeId = await getActiveProfileId();
  const querySnapshot = await getDocs(collection(db, COMPANIES_COLLECTION, activeId, 'library'));
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LibraryDocument));
};

export const saveLibraryDocument = async (docData: Omit<LibraryDocument, 'id'>) => {
  const activeId = await getActiveProfileId();
  const id = uuidv4();
  const docRef = doc(db, COMPANIES_COLLECTION, activeId, 'library', id);
  const newDoc = { ...docData, id, profileId: activeId };
  await setDoc(docRef, newDoc);
  return newDoc;
};

export const deleteLibraryDocument = async (id: string) => {
  const activeId = await getActiveProfileId();
  await deleteDoc(doc(db, COMPANIES_COLLECTION, activeId, 'library', id));
};

export const getCompanyDetails = getActiveProfile;
export const saveCompanyDetails = saveProfile;

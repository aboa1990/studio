
import { Document, CompanyProfile, Client, LibraryDocument } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_DOCS = 'forgedocs_documents';
const STORAGE_KEY_PROFILES = 'forgedocs_profiles';
const STORAGE_KEY_CLIENTS = 'forgedocs_clients';
const STORAGE_KEY_LIBRARY = 'forgedocs_library';
const STORAGE_KEY_ACTIVE_PROFILE_ID = 'forgedocs_active_profile_id';

const defaultProfileId = 'default-profile-1';

const defaultCompany: CompanyProfile = {
  id: defaultProfileId,
  name: 'ForgeDocs Maldives',
  address: 'H. Mookai Suites, Male, Maldives',
  email: 'hello@forgedocs.mv',
  phone: '+960 333-4444',
  gstNumber: 'GST-123456789',
  bankDetails: {
    bankName: 'Bank of Maldives (BML)',
    accountName: 'ForgeDocs Pvt Ltd',
    accountNumber: '7730000012345',
    branchName: 'Main Branch',
  }
};

export const getProfiles = (): CompanyProfile[] => {
  if (typeof window === 'undefined') return [defaultCompany];
  const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
  const profiles = stored ? JSON.parse(stored) : [defaultCompany];
  return profiles;
};

export const saveProfile = (profile: CompanyProfile) => {
  const profiles = getProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
};

export const deleteProfile = (id: string) => {
  const profiles = getProfiles();
  const filtered = profiles.filter((p) => p.id !== id);
  if (filtered.length === 0) return;
  
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(filtered));
  
  if (getActiveProfileId() === id) {
    setActiveProfileId(filtered[0].id);
  }
  
  const docs = getAllDocuments();
  const filteredDocs = docs.filter(d => d.profileId !== id);
  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(filteredDocs));

  const clients = getAllClients();
  const filteredClients = clients.filter(c => c.profileId !== id);
  localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(filteredClients));

  const library = getAllLibraryDocuments();
  const filteredLibrary = library.filter(l => l.profileId !== id);
  localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(filteredLibrary));
};

export const getActiveProfileId = (): string => {
  if (typeof window === 'undefined') return defaultProfileId;
  const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE_ID);
  if (activeId) return activeId;
  
  const profiles = getProfiles();
  return profiles[0]?.id || defaultProfileId;
};

export const setActiveProfileId = (id: string) => {
  localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, id);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('profileChanged'));
  }
};

export const getActiveProfile = (): CompanyProfile => {
  const profiles = getProfiles();
  const activeId = getActiveProfileId();
  return profiles.find(p => p.id === activeId) || profiles[0] || defaultCompany;
};

// Documents
export const getAllDocuments = (): Document[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY_DOCS);
  return stored ? JSON.parse(stored) : [];
};

export const getDocuments = (): Document[] => {
  const allDocs = getAllDocuments();
  const activeId = getActiveProfileId();
  return allDocs.filter(d => d.profileId === activeId || !d.profileId);
};

export const saveDocument = (doc: Document) => {
  const docs = getAllDocuments();
  const activeId = getActiveProfileId();
  const docToSave = { ...doc, profileId: doc.profileId || activeId };
  const index = docs.findIndex((d) => d.id === docToSave.id);
  if (index >= 0) {
    docs[index] = docToSave;
  } else {
    docs.push(docToSave);
  }
  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs));
};

export const deleteDocument = (id: string) => {
  const docs = getAllDocuments();
  const filtered = docs.filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(filtered));
};

// Clients
export const getAllClients = (): Client[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY_CLIENTS);
  return stored ? JSON.parse(stored) : [];
};

export const getClients = (): Client[] => {
  const allClients = getAllClients();
  const activeId = getActiveProfileId();
  return allClients.filter(c => c.profileId === activeId);
};

export const saveClient = (client: Client) => {
  const clients = getAllClients();
  const activeId = getActiveProfileId();
  const clientToSave = { ...client, profileId: client.profileId || activeId };
  const index = clients.findIndex((c) => c.id === clientToSave.id);
  if (index >= 0) {
    clients[index] = clientToSave;
  } else {
    clients.push(clientToSave);
  }
  localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
};

export const deleteClient = (id: string) => {
  const clients = getAllClients();
  const filtered = clients.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(filtered));
};

// Library
export const getAllLibraryDocuments = (): LibraryDocument[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY_LIBRARY);
  return stored ? JSON.parse(stored) : [];
};

export const getLibraryDocuments = (): LibraryDocument[] => {
  const all = getAllLibraryDocuments();
  const activeId = getActiveProfileId();
  return all.filter(l => l.profileId === activeId);
};

export const saveLibraryDocument = (doc: LibraryDocument) => {
  const library = getAllLibraryDocuments();
  const activeId = getActiveProfileId();
  const docToSave = { ...doc, profileId: doc.profileId || activeId };
  const index = library.findIndex((l) => l.id === docToSave.id);
  if (index >= 0) {
    library[index] = docToSave;
  } else {
    library.push(docToSave);
  }
  localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(library));
};

export const deleteLibraryDocument = (id: string) => {
  const library = getAllLibraryDocuments();
  const filtered = library.filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(filtered));
};

export const getCompanyDetails = getActiveProfile;
export const saveCompanyDetails = saveProfile;

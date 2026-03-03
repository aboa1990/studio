
import { create } from 'zustand'
import { supabase } from './supabase'
import { CompanyProfile } from './types'

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

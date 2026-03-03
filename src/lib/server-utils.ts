
// src/lib/server-utils.ts
import { supabase } from './supabase';
import { CompanyProfile } from './types';
import { cookies } from 'next/headers';

export const getActiveProfile = async (): Promise<CompanyProfile | null> => {
    const cookieStore = cookies();
    const profileId = cookieStore.get('currentProfileId')?.value;

    if (!profileId) {
        // If no ID is in cookies, fall back to the first profile
        const { data, error } = await supabase.from('company_profiles').select('*').limit(1).single();
        if (error || !data) {
            console.error("Could not fetch a default profile.", error);
            return null;
        }
        return data;
    }

    const { data, error } = await supabase.from('company_profiles').select('*').eq('id', profileId).single();

    if (error) {
        console.error(`Error fetching profile for ID: ${profileId}`, error);
        // Fallback or handle error appropriately
        return null;
    }

    return data;
};

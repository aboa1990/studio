'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  useEffect(() => {
    const { auth, firestore } = firebaseServices;

    // 1. Ensure user is signed in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        initiateAnonymousSignIn(auth);
      } else {
        // 2. Sync user profile to Firestore to satisfy security rules
        const userRef = doc(firestore, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          // If no profile, link to a default company ID initially
          // In a real app, this might be triggered by a "Create Company" flow
          const defaultCompanyId = localStorage.getItem('forgedocs_active_profile_id') || 'default-profile-1';
          await setDoc(userRef, {
            uid: user.uid,
            companyProfileId: defaultCompanyId,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      }
    });

    return () => unsubscribe();
  }, [firebaseServices]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
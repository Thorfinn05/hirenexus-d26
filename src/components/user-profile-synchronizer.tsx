
'use client';

import { useEffect } from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

/**
 * A component that listens for auth state changes and ensures a 
 * corresponding UserProfile document exists in Firestore.
 */
export function UserProfileSynchronizer() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  useEffect(() => {
    if (isUserLoading || !user || !db) return;

    const syncProfile = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // We defer creation to LoginPage which handles Role selection.
        // If they bypass login (somehow), we can create a default, but 
        // usually LoginPage is the entry point for new users.
        return; 
      } else {
        // Only update basic fields, don't touch the role here
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || userSnap.data().displayName,
          photoURL: user.photoURL || userSnap.data().photoURL,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    };

    syncProfile().catch(console.error);
  }, [user, isUserLoading, db]);

  return null;
}
'use client';

import { useEffect, useState } from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export type UserRole = 'recruiter' | 'candidate' | null;

export function useUserRole() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [role, setRole] = useState<UserRole>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      setIsRoleLoading(true);
      return;
    }

    if (!user || !db) {
      setRole(null);
      setIsRoleLoading(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().role) {
          setRole(docSnap.data().role as UserRole);
        } else {
          setRole(null); // Or provide a sensible default if necessary, but null means "not set yet"
        }
        setIsRoleLoading(false);
      },
      (error) => {
        console.error('Error fetching user role:', error);
        setIsRoleLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isUserLoading, db]);

  return { role, isRoleLoading };
}

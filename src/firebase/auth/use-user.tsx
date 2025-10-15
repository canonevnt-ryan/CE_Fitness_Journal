'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase';

export interface UseUserResult {
  user: User | null;
  isUserLoading: boolean;
}

export function useUser(): UseUserResult {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isUserLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return { user, isUserLoading };
}

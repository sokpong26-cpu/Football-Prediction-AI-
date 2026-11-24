import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';
import {
  signInWithGooglePopup,
  signOutFirebaseUser,
  syncUserProfileToFirestore,
} from '../services/firestoreService';
import { DbOrderRecord, DbUserProfile } from '../types';
import { appState } from '../services/store';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  idToken: string | null;
  dbProfile: DbUserProfile | null;
  dbOrders: DbOrderRecord[];
  loading: boolean;
  authError: string | null;
  isAdminVerified: boolean;
  signInGoogle: () => Promise<void>;
  signOutAll: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: {
    displayName?: string;
    phone?: string;
    bettingPlatform?: 'sokrizybet' | '1xbet';
    bettingAccountId?: string;
    bio?: string;
  }) => Promise<DbUserProfile | null>;
  createOrder: (serviceSlug: string, paymentMethod: string) => Promise<DbOrderRecord | null>;
  getFreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [dbProfile, setDbProfile] = useState<DbUserProfile | null>(null);
  const [dbOrders, setDbOrders] = useState<DbOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchBackendProfile = useCallback(async (user: FirebaseUser) => {
    try {
      const token = await user.getIdToken();
      setIdToken(token);

      const res = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to sync user profile');
      }

      const data = await res.json();
      setDbProfile(data.user || null);
      setDbOrders(Array.isArray(data.orders) ? data.orders : []);

      // If verified owner/admin via Google Sign-In, sync appState admin role seamlessly
      if (data.user && (data.user.role === 'owner' || data.user.role === 'admin')) {
        if (!appState.currentUser || appState.currentUser.role === 'user') {
          appState.login('sokpong', 'owner');
        }
      }

      // Sync Firestore public/private profile docs on first login cleanly
      await syncUserProfileToFirestore({
        uid: user.uid,
        email: user.email || '',
        displayName: data.user?.displayName || user.displayName || 'Player',
        phone: data.user?.phone || '',
        bettingPlatform: data.user?.bettingPlatform === '1xbet' ? '1xbet' : 'sokrizybet',
        bettingAccountId: data.user?.bettingAccountId || '',
        bio: data.user?.bio || '',
      }).catch(() => {
        // Non-blocking if email is unverified in test environments
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load account profile.';
      setAuthError(msg);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthError(null);
      if (user) {
        await fetchBackendProfile(user);
      } else {
        setIdToken(null);
        setDbProfile(null);
        setDbOrders([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [fetchBackendProfile]);

  const getFreshToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    const token = await auth.currentUser.getIdToken();
    setIdToken(token);
    return token;
  }, []);

  const signInGoogle = useCallback(async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const cred = await signInWithGooglePopup();
      if (cred.user) {
        await fetchBackendProfile(cred.user);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in cancelled or failed.';
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  }, [fetchBackendProfile]);

  const signOutAll = useCallback(async () => {
    setAuthError(null);
    await signOutFirebaseUser();
    setIdToken(null);
    setDbProfile(null);
    setDbOrders([]);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) {
      await fetchBackendProfile(auth.currentUser);
    }
  }, [fetchBackendProfile]);

  const updateProfile = useCallback(
    async (payload: {
      displayName?: string;
      phone?: string;
      bettingPlatform?: 'sokrizybet' | '1xbet';
      bettingAccountId?: string;
      bio?: string;
    }) => {
      const token = await getFreshToken();
      if (!token || !auth.currentUser) {
        throw new Error('Please sign in first to update your profile.');
      }
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Profile update failed');
      }
      setDbProfile(data.user);

      await syncUserProfileToFirestore({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || data.user.email,
        displayName: data.user.displayName,
        phone: data.user.phone,
        bettingPlatform: data.user.bettingPlatform,
        bettingAccountId: data.user.bettingAccountId,
        bio: data.user.bio,
      }).catch(() => {});

      return data.user as DbUserProfile;
    },
    [getFreshToken]
  );

  const createOrder = useCallback(
    async (serviceSlug: string, paymentMethod: string) => {
      const token = await getFreshToken();
      if (!token) return null;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serviceSlug, paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record order');
      }
      await refreshProfile();
      return data.order as DbOrderRecord;
    },
    [getFreshToken, refreshProfile]
  );

  const isAdminVerified =
    dbProfile?.role === 'owner' ||
    dbProfile?.role === 'admin' ||
    (firebaseUser?.email?.toLowerCase() === 'freeomg73@gmail.com' && firebaseUser?.emailVerified === true);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        idToken,
        dbProfile,
        dbOrders,
        loading,
        authError,
        isAdminVerified: Boolean(isAdminVerified),
        signInGoogle,
        signOutAll,
        refreshProfile,
        updateProfile,
        createOrder,
        getFreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}

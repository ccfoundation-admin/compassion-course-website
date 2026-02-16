import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  getIdTokenResult,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential,
  RecaptchaVerifier,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { createUserProfile, getUserProfile } from '../services/userProfileService';
import { getUserDoc, ensureUserDoc, type UserDoc, type UserStatus, type UserRole } from '../services/usersService';
import { logAuthDiagnostics, isDomainBlockingError, getDomainBlockingErrorMessage } from '../utils/authDiagnostics';

// Temporary fallback admin emails (used when Firestore is offline)
const ADMIN_EMAILS: string[] = [
  'info@compassioncf.com',
  'jaybond@compassioncf.com'
];

/** True if the user has email/password as a sign-in method (so they can log in with password). */
export function hasPasswordProvider(user: User | null): boolean {
  return !!user?.providerData?.some((p) => p.providerId === 'password');
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  /** True until admin check completes for the current user (only relevant when user is set). */
  adminLoading: boolean;
  /** Canonical user doc (users/{uid}); null while loading or if not yet created. */
  userDoc: UserDoc | null;
  userRole: UserRole | null;
  userStatus: UserStatus | null;
  isActive: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, recaptchaVerifier?: RecaptchaVerifier) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  linkEmailPassword: (password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user?.uid) {
        setAdminLoading(true);
        // Read-only admin check: getDoc(admins/{uid}) only; never write. Admin docs are created in Console or via Cloud Function.
        // For non-admin users, check admin status first (with timeout)
        const checkAdmin = async () => {
          try {
            const tokenResult = await Promise.race([
              getIdTokenResult(user, true),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Token check timeout')), 3000)
              )
            ]);
            
            const hasAdminClaim = tokenResult.claims?.admin === true;
            
            if (hasAdminClaim) {
              console.log('✅ ADMIN ACCESS CONFIRMED via custom claim!');
              setIsAdmin(true);
              return;
            }
          } catch (claimError: any) {
            if (!claimError?.message?.includes('timeout')) {
              console.warn('⚠️ Error checking custom claims:', claimError);
            }
          }
          
          // Check Firestore document (UID-only; rules allow read of own doc via isSelf)
          const docPath = `admins/${user.uid}`;
          console.log('[admin check] start uid=', user.uid);
          console.log('[admin check] doc path', docPath);
          try {
            const timeoutPromise = new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Admin check timeout')), 3000)
            );
            const adminDoc = await Promise.race([
              getDoc(doc(db, 'admins', user.uid)),
              timeoutPromise
            ]);
            console.log('[admin check] snap.exists()', adminDoc.exists());
            const data = adminDoc.data();
            if (adminDoc.exists()) {
              console.log('[admin check] snap.data()', data);
            }
            const status = data?.status;
            const role = data?.role;
            const okStatus = status === 'active' || status === 'approved';
            const okRole = role === 'admin' || role === 'superAdmin';
            const isAdminUser = adminDoc.exists() && okRole && okStatus;
            console.log('[admin check] end isAdmin=', !!isAdminUser);
            setIsAdmin(!!isAdminUser);
          } catch (error: any) {
            console.log('[admin check] catch e.code', error?.code, 'e.message', error?.message);
            const isOfflineError = error?.code === 'unavailable' || 
                                  error?.message?.includes('offline') ||
                                  error?.message?.includes('timeout');
            
            if (!isOfflineError) {
              console.error('❌ Error checking admin status:', error);
            }
            setIsAdmin(false);
          }
        };
        
        try {
          await checkAdmin();
        } catch (adminError) {
          console.error('Error in checkAdmin:', adminError);
          setIsAdmin(false);
        } finally {
          setAdminLoading(false);
        }
        
        // Token already refreshed in checkAdmin(); ensure user profile exists in background (non-blocking)
        getUserProfile(user.uid).then(existingProfile => {
          if (!existingProfile) {
            return createUserProfile(
              user.uid,
              user.email || '',
              user.displayName || user.email?.split('@')[0] || 'User',
              user.photoURL || undefined
            ).then(() => {
              console.log('[profile] created on login');
            });
          }
        }).catch(err => {
          const isOfflineError = err?.code === 'unavailable' || 
                                err?.message?.includes('offline');
          if (!isOfflineError) {
            console.error('[profile] failed on login', err);
          }
        });
      } else {
        setAdminLoading(false);
        setIsAdmin(false);
        setUserDoc(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load users/{uid} for role/status gating (single source of truth). Retry if missing (trigger may be delayed), then bootstrap with ensureUserDoc.
  useEffect(() => {
    if (!user?.uid) {
      setUserDoc(null);
      return;
    }
    const uid = user.uid;
    const email = user.email ?? '';
    const displayName = user.displayName ?? user.email?.split('@')[0] ?? 'User';
    let cancelled = false;
    const load = async () => {
      let doc = await getUserDoc(uid);
      if (cancelled) return;
      if (!doc) {
        await new Promise((r) => setTimeout(r, 1000));
        if (cancelled) return;
        doc = await getUserDoc(uid);
      }
      if (cancelled) return;
      if (!doc) {
        await new Promise((r) => setTimeout(r, 2000));
        if (cancelled) return;
        doc = await getUserDoc(uid);
      }
      if (cancelled) return;
      if (!doc) {
        try {
          const adminSnap = await getDoc(doc(db, 'admins', uid));
          if (adminSnap.exists() || (user.email && ADMIN_EMAILS.includes(user.email))) {
            doc = await ensureUserDoc(uid, email, displayName, { status: 'active', role: 'admin' });
          } else {
            doc = await ensureUserDoc(uid, email, displayName);
          }
        } catch (e) {
          if (!cancelled) setUserDoc(null);
          return;
        }
      }
      if (!cancelled) {
        setUserDoc(doc);
        if (doc.status === 'active' && doc.role === 'admin') setIsAdmin(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.email, user?.displayName]);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.email);
      return userCredential;
    } catch (error: any) {
      console.error('Firebase login error:', error);
      
      // Add detailed diagnostic logging for domain blocking errors
      if (isDomainBlockingError(error)) {
        console.error('🚫 DOMAIN BLOCKING ERROR DETECTED');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        logAuthDiagnostics();
        console.error('📋 Fix instructions:', getDomainBlockingErrorMessage(error));
      }
      
      // Re-throw the error so the LoginPage can handle it
      throw error;
    }
  };

  const register = async (email: string, password: string, recaptchaVerifier?: RecaptchaVerifier) => {
    try {
      // Note: createUserWithEmailAndPassword doesn't directly accept recaptchaVerifier,
      // but Firebase will use it automatically if initialized. For explicit v2 usage,
      // we ensure the verifier is set up before calling createUserWithEmailAndPassword.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[signup] success', userCredential.user.email);
      
      // Auto-create user profile
      try {
        const existingProfile = await getUserProfile(userCredential.user.uid);
        if (!existingProfile) {
          await createUserProfile(
            userCredential.user.uid,
            email,
            userCredential.user.displayName || email.split('@')[0],
            userCredential.user.photoURL || undefined  // Convert null to undefined
          );
          console.log('[profile] created on signup');
        }
      } catch (profileError) {
        console.error('[profile] failed on signup', profileError);
        // Don't fail registration if profile creation fails
      }
      
      return userCredential;
    } catch (error: any) {
      console.error('[signup] failure', error?.code, error?.message);
      // Re-throw the error so the RegisterPage can handle it
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔵 Starting Google sign-in...');
      logAuthDiagnostics();
      
      const provider = new GoogleAuthProvider();
      // Add custom parameters for better OAuth experience
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('🔵 Attempting signInWithPopup...');
      const userCredential = await signInWithPopup(auth, provider);
      console.log('✅ Google sign-in successful:', userCredential.user.email);
      // Auto-create user profile
      try {
        const existingProfile = await getUserProfile(userCredential.user.uid);
        if (!existingProfile) {
          await createUserProfile(
            userCredential.user.uid,
            userCredential.user.email || '',
            userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
            userCredential.user.photoURL || undefined  // Convert null to undefined
          );
          console.log('[profile] created from Google sign-in');
        }
      } catch (profileError) {
        console.error('[profile] failed on Google sign-in', profileError);
      }
      
      return userCredential;
    } catch (error: any) {
      console.error('[signup] failure Google', error?.code, error?.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Full error:', JSON.stringify(error, null, 2));
      
      // Add detailed diagnostic logging for domain blocking errors
      if (isDomainBlockingError(error)) {
        console.error('🚫 DOMAIN BLOCKING ERROR DETECTED');
        logAuthDiagnostics();
        console.error('📋 Fix instructions:', getDomainBlockingErrorMessage(error));
      }
      
      // Provide more specific error messages
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/unauthorized-domain' || error.code?.includes('requests-from-referer')) {
        const currentDomain = window.location.hostname;
        throw new Error(`This domain (${currentDomain}) is not authorized for Google sign-in. Please add it to Firebase Console → Authentication → Settings → Authorized domains. See FIX_AUTH_DOMAIN_BLOCKING.md for detailed instructions.`);
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Google sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with this email using a different sign-in method. Please use email/password login instead.');
      }
      
      throw error;
    }
  };

  const linkEmailPassword = async (password: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser?.email) {
      throw new Error('You must be signed in with an email to set a password.');
    }
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await linkWithCredential(currentUser, credential);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent to:', email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Add detailed diagnostic logging for domain blocking errors
      if (isDomainBlockingError(error)) {
        console.error('🚫 DOMAIN BLOCKING ERROR DETECTED');
        logAuthDiagnostics();
        console.error('📋 Fix instructions:', getDomainBlockingErrorMessage(error));
      }
      
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    isAdmin,
    loading,
    adminLoading,
    userDoc,
    userRole: userDoc?.role ?? null,
    userStatus: userDoc?.status ?? null,
    isActive: (userDoc?.status ?? '') === 'active',
    login,
    register,
    signInWithGoogle,
    linkEmailPassword,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signOut, 
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  FirebaseUser,
  AuthError
} from '../firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isEmailVerified: boolean;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      if (result.user && !result.user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
      }
    } catch (error: any) {
      const firebaseError = error as AuthError;
      let errorMessage = 'Login failed';
      
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        default:
          errorMessage = firebaseError.message || 'Login failed';
      }
      
      throw new Error(errorMessage);
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await sendEmailVerification(result.user);
      
      await signOut(auth);
      
      throw new Error('Registration successful! Please check your email to verify your account before signing in.');
    } catch (error: any) {
      const firebaseError = error as AuthError;
      let errorMessage = 'Registration failed';
      
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many registration attempts. Please try again later.';
          break;
        default:
          errorMessage = firebaseError.message || 'Registration failed';
      }
      
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result.user && !result.user.emailVerified) {
        await sendEmailVerification(result.user);
        await signOut(auth);
        throw new Error('Please check your email to verify your account before signing in.');
      }
    } catch (error: any) {
      const firebaseError = error as AuthError;
      let errorMessage = 'Google login failed';
      
      switch (firebaseError.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Google sign-in was cancelled.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Google sign-in popup was blocked by your browser.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Google sign-in was cancelled.';
          break;
        default:
          errorMessage = firebaseError.message || 'Google login failed';
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      const firebaseError = error as AuthError;
      throw new Error(firebaseError.message || 'Logout failed');
    }
  };

  const resendVerificationEmail = async () => {
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
      } catch (error: any) {
        const firebaseError = error as AuthError;
        throw new Error(firebaseError.message || 'Failed to resend verification email');
      }
    }
  };

  const value = {
    user,
    loading,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    isEmailVerified: user?.emailVerified || false,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
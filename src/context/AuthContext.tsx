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
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  FirebaseUser,
  AuthError,
  updateEmail as firebaseUpdateEmail
} from '../firebase';
import axios from 'axios';

interface UserProfile {
  userId: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  profile: UserProfile | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isEmailVerified: boolean;
  resendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>, password: string) => Promise<{ emailChanged: boolean }>;
  updateEmail: (newEmail: string, password: string) => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
  fetchUserProfile: () => Promise<void>;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        // Use firebaseUser directly to avoid stale closure over `user` state
        try {
          const response = await axios.get('/api/user/profile', {
            headers: { 'x-user-id': firebaseUser.uid }
          });
          setProfile(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile on auth change:', error);
        }
      } else {
        setProfile(null);
      }
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

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(result.user, {
          displayName: displayName
        });
      }
      
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

  const reloadUser = async () => {
    if (user) {
      try {
        await user.reload();
        setUser({ ...user } as FirebaseUser);
      } catch (error) {
        console.error('Failed to reload user:', error);
      }
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get('/api/user/profile', {
        headers: { 'x-user-id': user.uid }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!user || !user.email) return false;
    
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>, password: string): Promise<{ emailChanged: boolean }> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const isValid = await verifyPassword(password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    try {
      const currentProfile = profile || { userId: user.uid, fullName: '', phone: '', dateOfBirth: '', gender: '' };
      
      const response = await axios.put('/api/user/profile', {
        userId: user.uid,
        fullName: profileData.fullName ?? currentProfile.fullName,
        phone: profileData.phone ?? currentProfile.phone,
        dateOfBirth: profileData.dateOfBirth ?? currentProfile.dateOfBirth,
        gender: profileData.gender ?? currentProfile.gender,
        currentEmail: user.email,
        password
      });

      await fetchUserProfile();

      return { emailChanged: response.data.emailChanged };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const updateEmail = async (newEmail: string, password: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const isValid = await verifyPassword(password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    try {
      await axios.put('/api/user/profile', {
        userId: user.uid,
        fullName: profile?.fullName || '',
        phone: profile?.phone || '',
        dateOfBirth: profile?.dateOfBirth || '',
        gender: profile?.gender || '',
        currentEmail: user.email,
        newEmail,
        password
      });

      await firebaseUpdateEmail(user, newEmail);
      await sendEmailVerification(user);
      await signOut(auth);
      
      throw new Error('Email updated. Please check your new email to verify your account.');
    } catch (error: any) {
      if (error.message.includes('Email updated')) {
        throw error;
      }
      throw new Error(error.response?.data?.error || 'Failed to update email');
    }
  };

  const value = {
    user,
    loading,
    profile,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    isEmailVerified: user?.emailVerified || false,
    resendVerificationEmail,
    reloadUser,
    fetchUserProfile,
    updateUserProfile,
    updateEmail,
    verifyPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
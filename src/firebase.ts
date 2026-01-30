import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA6kbO8YeAr3HaTiRS6jmylTa-Yxz-cifc",
  authDomain: "zyra-fashion-445f4.firebaseapp.com",
  projectId: "zyra-fashion-445f4",
  storageBucket: "zyra-fashion-445f4.firebasestorage.app",
  messagingSenderId: "249885959258",
  appId: "1:249885959258:web:e93b93be2c5cfdee84e463",
  measurementId: "G-1SLTZ72DWD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure auth settings
auth.settings.appVerificationDisabledForTesting = false;

// Export Firebase functions and types
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
};

export type { FirebaseUser, AuthError };

export default app;
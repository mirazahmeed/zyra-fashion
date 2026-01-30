import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const { user, isEmailVerified } = useAuth();
  const [showModal, setShowModal] = useState(true);

  if (user && isEmailVerified) {
    return <>{children}</>;
  }

  if (user && !isEmailVerified) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-8">
            <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-light tracking-wide text-black mb-4">
            Email Verification Required
          </h1>
          
          <p className="text-gray-600 mb-8">
            Please verify your email address before placing orders. Check your inbox for the verification link.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-black text-white text-sm font-medium tracking-wider uppercase rounded-md hover:bg-gray-900 transition-colors duration-200"
            >
              I've Verified My Email
            </button>
            
            <Link
              to="/"
              className="block w-full py-3 px-4 text-center text-sm font-medium tracking-wider text-black uppercase border border-gray-300 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-8">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-light tracking-wide text-black mb-4">
          Sign In Required
        </h1>
        
        <p className="text-gray-600 mb-8">
          Please sign in or create an account to place orders.
        </p>
        
        <div className="space-y-3">
          <Link
            to="/auth"
            className="block w-full py-3 px-4 bg-black text-white text-sm font-medium tracking-wider uppercase rounded-md hover:bg-gray-900 transition-colors duration-200 text-center"
          >
            Sign In / Create Account
          </Link>
          
          <Link
            to="/"
            className="block w-full py-3 px-4 text-center text-sm font-medium tracking-wider text-black uppercase border border-gray-300 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthGuard;
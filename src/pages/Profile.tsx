import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthGuard from '../components/AuthGuard';

const Profile: React.FC = () => {
  const { user, isEmailVerified, resendVerificationEmail, profile, fetchUserProfile, updateUserProfile } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage('');
    try {
      await resendVerificationEmail();
      setResendMessage('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setResendMessage(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || ''
      });
    }
    setMessage({ type: '', text: '' });
  };

  const handleSaveClick = () => {
    setShowPasswordModal(true);
    setPasswordError('');
  };

  const handleConfirmSave = async () => {
    if (!password) {
      setPasswordError('Please enter your password to confirm changes');
      return;
    }

    setIsSaving(true);
    setPasswordError('');

    try {
      const result = await updateUserProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender
      }, password);

      setShowPasswordModal(false);
      setPassword('');
      setIsEditing(false);

      if (result.emailChanged) {
        setMessage({ 
          type: 'warning', 
          text: 'Profile updated! Please check your new email to verify your account.' 
        });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
      
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setPassword('');
    setPasswordError('');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold tracking-tight text-black mb-4">
              Account Settings
            </h1>
            <nav className="text-sm text-gray-600">
              <Link to="/" className="hover:text-black">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-black">Profile</span>
            </nav>
          </motion.div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : message.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-medium text-black mb-1">
                    {user?.displayName || 'User'}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">{user?.email}</p>
                  <div className="flex items-center justify-center mb-3">
                    {isEmailVerified ? (
                      <span className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Email Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Email Not Verified
                      </span>
                    )}
                  </div>
                  {!isEmailVerified && (
                    <div className="mt-3">
                      <button
                        onClick={handleResendVerification}
                        disabled={isResending}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                      >
                        {isResending ? 'Sending...' : 'Resend verification email'}
                      </button>
                      {resendMessage && (
                        <p className={`text-xs mt-2 ${resendMessage.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                          {resendMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                {!isEmailVerified && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-yellow-600 mt-0.5 mr-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-yellow-800">Email Verification Required</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          You must verify your email address before you can place orders. 
                          This helps us ensure the security of your account and order notifications.
                        </p>
                        <button
                          onClick={handleResendVerification}
                          disabled={isResending}
                          className="mt-3 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                        >
                          {isResending ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                        {resendMessage && (
                          <p className={`text-sm mt-2 ${resendMessage.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                            {resendMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-black">Profile Information</h3>
                    {!isEditing ? (
                      <button
                        onClick={handleEditClick}
                        className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveClick}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-md ${isEditing ? 'bg-white focus:ring-2 focus:ring-black focus:border-transparent' : 'bg-gray-100 text-gray-700'}`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-md ${isEditing ? 'bg-white focus:ring-2 focus:ring-black focus:border-transparent' : 'bg-gray-100 text-gray-700'}`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-md ${isEditing ? 'bg-white focus:ring-2 focus:ring-black focus:border-transparent' : 'bg-gray-100 text-gray-700'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-md ${isEditing ? 'bg-white focus:ring-2 focus:ring-black focus:border-transparent' : 'bg-gray-100 text-gray-700'}`}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-black mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={user?.displayName || 'N/A'}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-black mb-4">Quick Links</h3>
                  <div className="space-y-2">
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Order History
                    </Link>
                    <Link
                      to="/cart"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Shopping Cart
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Password Confirmation Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-medium text-black mb-4">Confirm Your Changes</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please enter your password to confirm the changes to your profile.
              </p>
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-sm text-red-600 mt-2">{passwordError}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Confirm & Save'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default Profile;

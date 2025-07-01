import React, { useState } from 'react';
import {
  Close as X,
  VpnKey as Key,
  Visibility as Eye,
  VisibilityOff as EyeOff,
  Warning as AlertCircle
} from '@mui/icons-material';
import { api } from '../services/api';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const ChangePasswordModal = ({ isOpen, onClose, onPasswordChanged, isFirstLogin = false }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswords = () => {
    if (!formData.new_password) {
      setError('New password is required');
      return false;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      return false;
    }

    // Check password strength
    const requirements = [
      { test: (pwd) => pwd.length >= 8, message: 'Password must be at least 8 characters' },
      { test: (pwd) => /[A-Z]/.test(pwd), message: 'Password must contain an uppercase letter' },
      { test: (pwd) => /[a-z]/.test(pwd), message: 'Password must contain a lowercase letter' },
      { test: (pwd) => /\d/.test(pwd), message: 'Password must contain a number' },
      { test: (pwd) => /[!@#$%^&*]/.test(pwd), message: 'Password must contain a special character' }
    ];

    for (const requirement of requirements) {
      if (!requirement.test(formData.new_password)) {
        setError(requirement.message);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.put('/auth/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password
      });

      if (response.data.success) {
        // Reset form
        setFormData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        
        // Notify parent component
        if (onPasswordChanged) {
          onPasswordChanged();
        }
        
        onClose();
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (isFirstLogin) {
      // Don't allow closing on first login
      return;
    }
    setFormData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isFirstLogin ? 'Set New Password' : 'Change Password'}
          </h2>
          {!isFirstLogin && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X />
            </button>
          )}
        </div>

        {/* First Login Notice */}
        {isFirstLogin && (
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-800">Password Change Required</h3>
                <p className="text-sm text-blue-700">
                  For security reasons, you must change your password before continuing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-b">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-gray-400" style={{fontSize: 16}} />
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="current_password"
                value={formData.current_password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff style={{fontSize: 16}} /> : <Eye style={{fontSize: 16}} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password *
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-gray-400" style={{fontSize: 16}} />
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="new_password"
                value={formData.new_password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff style={{fontSize: 16}} /> : <Eye style={{fontSize: 16}} />}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.new_password && (
            <PasswordStrengthIndicator 
              password={formData.new_password} 
              showRequirements={true}
            />
          )}

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-gray-400" style={{fontSize: 16}} />
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff style={{fontSize: 16}} /> : <Eye style={{fontSize: 16}} />}
              </button>
            </div>
            {formData.confirm_password && formData.new_password !== formData.confirm_password && (
              <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            {!isFirstLogin && (
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || formData.new_password !== formData.confirm_password}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Changing...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

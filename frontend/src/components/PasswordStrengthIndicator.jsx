import React from 'react';
import { Check, Close as X, Warning as AlertCircle } from '@mui/icons-material';

const PasswordStrengthIndicator = ({ password, showRequirements = true }) => {
  const requirements = [
    {
      id: 'length',
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter',
      test: (pwd) => /[A-Z]/.test(pwd)
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter',
      test: (pwd) => /[a-z]/.test(pwd)
    },
    {
      id: 'number',
      label: 'One number',
      test: (pwd) => /\d/.test(pwd)
    },
    {
      id: 'special',
      label: 'One special character (!@#$%^&*)',
      test: (pwd) => /[!@#$%^&*]/.test(pwd)
    }
  ];

  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: '' };
    
    const passedRequirements = requirements.filter(req => req.test(password)).length;
    
    if (passedRequirements <= 1) {
      return { score: 1, label: 'Very Weak', color: 'bg-red-500' };
    } else if (passedRequirements === 2) {
      return { score: 2, label: 'Weak', color: 'bg-orange-500' };
    } else if (passedRequirements === 3) {
      return { score: 3, label: 'Fair', color: 'bg-yellow-500' };
    } else if (passedRequirements === 4) {
      return { score: 4, label: 'Good', color: 'bg-blue-500' };
    } else {
      return { score: 5, label: 'Strong', color: 'bg-green-500' };
    }
  };

  const strength = getPasswordStrength();
  const isValid = requirements.every(req => req.test(password));

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      {password && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Password Strength</span>
            <span className={`text-sm font-medium ${
              strength.score <= 2 ? 'text-red-600' : 
              strength.score <= 3 ? 'text-yellow-600' : 
              strength.score === 4 ? 'text-blue-600' : 'text-green-600'
            }`}>
              {strength.label}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${(strength.score / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <AlertCircle style={{fontSize: 16}} className="text-gray-500" />
            <span className="text-sm text-gray-600">Password must contain:</span>
          </div>
          <div className="space-y-1 ml-6">
            {requirements.map(requirement => {
              const isPassed = requirement.test(password);
              return (
                <div key={requirement.id} className="flex items-center space-x-2">
                  {isPassed ? (
                    <Check style={{fontSize: 14}} className="text-green-500" />
                  ) : (
                    <X style={{fontSize: 14}} className="text-gray-400" />
                  )}
                  <span className={`text-sm ${
                    isPassed ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {requirement.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall Status */}
      {password && (
        <div className={`flex items-center space-x-2 p-2 rounded ${
          isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {isValid ? (
            <Check style={{fontSize: 16}} className="text-green-600" />
          ) : (
            <X style={{fontSize: 16}} className="text-red-600" />
          )}
          <span className="text-sm font-medium">
            {isValid ? 'Password meets all requirements' : 'Password does not meet requirements'}
          </span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;

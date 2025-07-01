import React, { useState } from 'react';
import {
  Close as X,
  Person as User,
  Email as Mail,
  Phone,
  LocationOn as MapPin,
  Work as Briefcase,
  Key,
  Visibility as Eye,
  VisibilityOff as EyeOff
} from '@mui/icons-material';
import { api } from '../services/api';

const AddWorkerModal = ({ isOpen, onClose, onWorkerAdded }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employee_id: '',
    worker_type: 'ground_worker',
    role: 'carer',
    employment_type: 'full_time',
    start_date: '',
    hourly_rate: '',
    contract_hours_per_week: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    auto_generate_password: true,
    custom_password: '',
    send_welcome_email: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Role options based on worker type
  const roleOptions = {
    ground_worker: [
      { value: 'carer', label: 'Carer' },
      { value: 'senior_carer', label: 'Senior Carer' },
      { value: 'trainee', label: 'Trainee' }
    ],
    office_worker: [
      { value: 'admin', label: 'Administrator' },
      { value: 'coordinator', label: 'Coordinator' },
      { value: 'supervisor', label: 'Supervisor' }
    ]
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'worker_type') {
      // Reset role when worker type changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        role: roleOptions[value][0].value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedPassword('');

    try {
      const response = await api.post('/users', formData);
      
      if (response.data.success) {
        if (response.data.data.generated_password) {
          setGeneratedPassword(response.data.data.generated_password);
        }
        
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          employee_id: '',
          worker_type: 'ground_worker',
          role: 'carer',
          employment_type: 'full_time',
          start_date: '',
          hourly_rate: '',
          contract_hours_per_week: '',
          address_line1: '',
          address_line2: '',
          city: '',
          postal_code: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          auto_generate_password: true,
          custom_password: '',
          send_welcome_email: true
        });
        
        // Notify parent component
        if (onWorkerAdded) {
          onWorkerAdded(response.data.data);
        }
        
        // Don't close modal immediately if password was generated (show it to user)
        if (!response.data.data.generated_password) {
          onClose();
        }
      }
    } catch (err) {
      console.error('Error creating worker:', err);
      setError(err.response?.data?.error || 'Failed to create worker');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGeneratedPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Worker</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X />
          </button>
        </div>

        {/* Generated Password Display */}
        {generatedPassword && (
          <div className="p-6 bg-green-50 border-b">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="text-green-600" />
              <h3 className="font-semibold text-green-800">Worker Created Successfully!</h3>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Please share these login credentials securely with the new worker:
            </p>
            <div className="bg-white p-3 rounded border">
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Password:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{generatedPassword}</code></p>
            </div>
            <p className="text-xs text-green-600 mt-2">
              The worker will be required to change their password on first login.
            </p>
            <button
              onClick={handleClose}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-6 bg-red-50 border-b">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Worker Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Worker Type *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="worker_type"
                  value="ground_worker"
                  checked={formData.worker_type === 'ground_worker'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Ground Worker (Mobile App Only)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="worker_type"
                  value="office_worker"
                  checked={formData.worker_type === 'office_worker'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Office Worker (Web + Mobile)</span>
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" style={{fontSize: 16}} />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" style={{fontSize: 16}} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" style={{fontSize: 16}} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Role and Employment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roleOptions[formData.worker_type].map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type
              </label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="bank">Bank</option>
                <option value="agency">Agency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>

          {/* Employment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate (£)
              </label>
              <input
                type="number"
                step="0.01"
                name="hourly_rate"
                value={formData.hourly_rate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Hours/Week
              </label>
              <input
                type="number"
                step="0.5"
                name="contract_hours_per_week"
                value={formData.contract_hours_per_week}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="37.5"
              />
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" style={{fontSize: 16}} />
                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter address line 1"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter address line 2 (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter emergency contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter emergency contact phone"
                />
              </div>
            </div>
          </div>

          {/* Password Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Password Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="auto_generate_password"
                  checked={formData.auto_generate_password}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">
                  Auto-generate secure password (recommended)
                </label>
              </div>

              {!formData.auto_generate_password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Password *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 text-gray-400" style={{fontSize: 16}} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="custom_password"
                      value={formData.custom_password}
                      onChange={handleInputChange}
                      required={!formData.auto_generate_password}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter custom password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff style={{fontSize: 16}} /> : <Eye style={{fontSize: 16}} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                  </p>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="send_welcome_email"
                  checked={formData.send_welcome_email}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">
                  Send welcome email with login instructions
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Creating...' : 'Create Worker'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkerModal;

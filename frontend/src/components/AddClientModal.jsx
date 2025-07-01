import React, { useState } from 'react';
import {
  Close as X,
  Person as User,
  Phone,
  LocationOn as MapPin,
  Favorite as Heart,
  CalendarToday as Calendar,
  Group as Users
} from '@mui/icons-material';
import { api } from '../services/api';

const AddClientModal = ({ isOpen, onClose, onClientAdded }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    preferred_name: '',
    date_of_birth: '',
    sex: 'prefer_not_to_say',
    nhs_number: '',
    phone: '',
    mobile: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    medical_conditions: '',
    allergies: '',
    mobility_level: 'independent',
    cognitive_status: 'alert',
    communication_needs: '',
    preferred_language: 'English',
    dietary_requirements: '',
    fall_risk: 'low',
    service_start_date: '',
    funding_source: 'private',
    primary_contact_name: '',
    primary_contact_phone: '',
    primary_contact_relationship: '',
    gp_name: '',
    gp_phone: '',
    gp_email: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sexOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ];

  const mobilityOptions = [
    { value: 'independent', label: 'Independent' },
    { value: 'walking_aid', label: 'Walking Aid Required' },
    { value: 'wheelchair', label: 'Wheelchair User' },
    { value: 'bed_bound', label: 'Bed Bound' }
  ];

  const cognitiveOptions = [
    { value: 'alert', label: 'Alert' },
    { value: 'mild_impairment', label: 'Mild Impairment' },
    { value: 'moderate_impairment', label: 'Moderate Impairment' },
    { value: 'severe_impairment', label: 'Severe Impairment' }
  ];

  const fallRiskOptions = [
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' }
  ];

  const fundingOptions = [
    { value: 'private', label: 'Private' },
    { value: 'local_authority', label: 'Local Authority' },
    { value: 'nhs', label: 'NHS' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'mixed', label: 'Mixed Funding' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/clients', formData);
      
      if (response.data.success) {
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          preferred_name: '',
          date_of_birth: '',
          sex: 'prefer_not_to_say',
          nhs_number: '',
          phone: '',
          mobile: '',
          address_line1: '',
          address_line2: '',
          city: '',
          postal_code: '',
          medical_conditions: '',
          allergies: '',
          mobility_level: 'independent',
          cognitive_status: 'alert',
          communication_needs: '',
          preferred_language: 'English',
          dietary_requirements: '',
          fall_risk: 'low',
          service_start_date: '',
          funding_source: 'private',
          primary_contact_name: '',
          primary_contact_phone: '',
          primary_contact_relationship: '',
          gp_name: '',
          gp_phone: '',
          gp_email: ''
        });
        
        // Notify parent component
        if (onClientAdded) {
          onClientAdded(response.data.data);
        }
        
        onClose();
      }
    } catch (err) {
      console.error('Error creating client:', err);
      setError(err.response?.data?.error || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-6 bg-red-50 border-b">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <User className="mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
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
                  Preferred Name
                </label>
                <input
                  type="text"
                  name="preferred_name"
                  value={formData.preferred_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter preferred name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" style={{fontSize: 16}} />
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sex *
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sexOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NHS Number
                </label>
                <input
                  type="text"
                  name="nhs_number"
                  value={formData.nhs_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter NHS number"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Phone className="mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <MapPin className="mr-2" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter address line 1"
                />
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
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>

          {/* Care Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Heart className="mr-2" />
              Care Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Conditions
                </label>
                <textarea
                  name="medical_conditions"
                  value={formData.medical_conditions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter medical conditions"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter allergies"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobility Level
                </label>
                <select
                  name="mobility_level"
                  value={formData.mobility_level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mobilityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognitive Status
                </label>
                <select
                  name="cognitive_status"
                  value={formData.cognitive_status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {cognitiveOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fall Risk
                </label>
                <select
                  name="fall_risk"
                  value={formData.fall_risk}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fallRiskOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Language
                </label>
                <input
                  type="text"
                  name="preferred_language"
                  value={formData.preferred_language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter preferred language"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Communication Needs
                </label>
                <textarea
                  name="communication_needs"
                  value={formData.communication_needs}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter communication needs (e.g., hearing aid, large print)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Requirements
                </label>
                <textarea
                  name="dietary_requirements"
                  value={formData.dietary_requirements}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter dietary requirements"
                />
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Service Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Start Date *
                </label>
                <input
                  type="date"
                  name="service_start_date"
                  value={formData.service_start_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Funding Source
                </label>
                <select
                  name="funding_source"
                  value={formData.funding_source}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fundingOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Users className="mr-2" />
              Emergency Contacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Contact Name
                </label>
                <input
                  type="text"
                  name="primary_contact_name"
                  value={formData.primary_contact_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter primary contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Contact Phone
                </label>
                <input
                  type="tel"
                  name="primary_contact_phone"
                  value={formData.primary_contact_phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter primary contact phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  name="primary_contact_relationship"
                  value={formData.primary_contact_relationship}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Daughter, Son, Spouse"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GP Name
                </label>
                <input
                  type="text"
                  name="gp_name"
                  value={formData.gp_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter GP name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GP Phone
                </label>
                <input
                  type="tel"
                  name="gp_phone"
                  value={formData.gp_phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter GP phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GP Email
                </label>
                <input
                  type="email"
                  name="gp_email"
                  value={formData.gp_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter GP email"
                />
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
              <span>{loading ? 'Creating...' : 'Create Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;

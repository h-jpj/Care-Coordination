import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  PhoneAndroid as MobileIcon,
  LocationOn as LocationIcon,
  Favorite as HeartIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  LocalHospital as MedicalIcon,
  Accessibility as AccessibilityIcon,
  Psychology as PsychologyIcon
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
  const [success, setSuccess] = useState(false);

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
        setSuccess(true);

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
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            <Typography variant="h6">
              Add New Client
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Client created successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Basic Information
            </Box>
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Preferred Name"
                name="preferred_name"
                value={formData.preferred_name}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Sex</InputLabel>
                <Select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  label="Sex"
                >
                  {sexOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NHS Number"
                name="nhs_number"
                value={formData.nhs_number}
                onChange={handleInputChange}
                placeholder="Enter NHS number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MedicalIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Contact Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon color="primary" />
              Contact Information
            </Box>
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MobileIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Address Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="primary" />
              Address Information
            </Box>
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>

          {/* Care Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HeartIcon color="error" />
              Care Information
            </Box>
          </Typography>
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
              <GroupIcon className="mr-2" />
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Client'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddClientModal;

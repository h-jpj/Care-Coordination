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
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  InputAdornment,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  PhoneAndroid as MobileIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as CarIcon,
  ContactEmergency as EmergencyIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { api } from '../services/api';

const AddWorkerModal = ({ isOpen, onClose, onWorkerAdded }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    employee_id: '',
    worker_type: 'ground_worker',
    role: 'carer',
    employment_type: 'full_time',
    start_date: '',
    hourly_rate: '',
    contract_hours_per_week: '',
    transport_type: 'walking',
    has_own_transport: false,
    availability: {
      monday: { available: false, start_time: '09:00', end_time: '17:00' },
      tuesday: { available: false, start_time: '09:00', end_time: '17:00' },
      wednesday: { available: false, start_time: '09:00', end_time: '17:00' },
      thursday: { available: false, start_time: '09:00', end_time: '17:00' },
      friday: { available: false, start_time: '09:00', end_time: '17:00' },
      saturday: { available: false, start_time: '09:00', end_time: '17:00' },
      sunday: { available: false, start_time: '09:00', end_time: '17:00' }
    },
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    auto_generate_password: true,
    custom_password: '',
    send_welcome_email: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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

  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
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
          mobile: '',
          employee_id: '',
          worker_type: 'ground_worker',
          role: 'carer',
          employment_type: 'full_time',
          start_date: '',
          hourly_rate: '',
          contract_hours_per_week: '',
          transport_type: 'walking',
          has_own_transport: false,
          availability: {
            monday: { available: false, start_time: '09:00', end_time: '17:00' },
            tuesday: { available: false, start_time: '09:00', end_time: '17:00' },
            wednesday: { available: false, start_time: '09:00', end_time: '17:00' },
            thursday: { available: false, start_time: '09:00', end_time: '17:00' },
            friday: { available: false, start_time: '09:00', end_time: '17:00' },
            saturday: { available: false, start_time: '09:00', end_time: '17:00' },
            sunday: { available: false, start_time: '09:00', end_time: '17:00' }
          },
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
              Add New Worker
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
            Worker created successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {generatedPassword && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Worker Created Successfully!
            </Typography>
            <Typography variant="body2" gutterBottom>
              Please share these login credentials securely with the new worker:
            </Typography>
            <Box sx={{ mt: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="body2"><strong>Email:</strong> {formData.email}</Typography>
              <Typography variant="body2"><strong>Password:</strong> <code>{generatedPassword}</code></Typography>
            </Box>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              The worker will be required to change their password on first login.
            </Typography>
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Worker Type Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Worker Type *
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                row
                name="worker_type"
                value={formData.worker_type}
                onChange={handleInputChange}
              >
                <FormControlLabel
                  value="ground_worker"
                  control={<Radio />}
                  label="Ground Worker (Mobile App Only)"
                />
                <FormControlLabel
                  value="office_worker"
                  control={<Radio />}
                  label="Office Worker (Web + Mobile)"
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Basic Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Basic Information
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
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

          {/* Employment Details */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Employment Details
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="Role"
                >
                  {roleOptions[formData.worker_type].map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleInputChange}
                  label="Employment Type"
                >
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="bank">Bank</MenuItem>
                  <MenuItem value="agency">Agency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                placeholder="Auto-generated if empty"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Start Date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Hourly Rate (£)"
                name="hourly_rate"
                type="number"
                step="0.01"
                value={formData.hourly_rate}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">£</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contract Hours/Week"
                name="contract_hours_per_week"
                type="number"
                step="0.5"
                value={formData.contract_hours_per_week}
                onChange={handleInputChange}
                placeholder="37.5"
              />
            </Grid>
          </Grid>

          {/* Availability Section */}
          <Box sx={{ mt: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Availability
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select the days and times when this worker is available. This helps with scheduling around childcare and other commitments.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(formData.availability).map(([day, dayData]) => (
                <Card key={day} variant="outlined" sx={{
                  p: 2,
                  bgcolor: dayData.available ? 'primary.50' : 'grey.50',
                  borderColor: dayData.available ? 'primary.200' : 'grey.300'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={dayData.available}
                          onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                        />
                      }
                      label={day.charAt(0).toUpperCase() + day.slice(1)}
                      sx={{ minWidth: 120 }}
                    />

                    {dayData.available && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <TextField
                          label="Start Time"
                          type="time"
                          value={dayData.start_time}
                          onChange={(e) => handleAvailabilityChange(day, 'start_time', e.target.value)}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="End Time"
                          type="time"
                          value={dayData.end_time}
                          onChange={(e) => handleAvailabilityChange(day, 'end_time', e.target.value)}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {(() => {
                            const start = new Date(`2000-01-01T${dayData.start_time}`);
                            const end = new Date(`2000-01-01T${dayData.end_time}`);
                            const diff = (end - start) / (1000 * 60 * 60);
                            return diff > 0 ? `${diff.toFixed(1)}h` : '';
                          })()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>

          {/* Transport Section */}
          <Box sx={{ mt: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CarIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">
                Transport & Mobility
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Transport Type</InputLabel>
                  <Select
                    name="transport_type"
                    value={formData.transport_type}
                    onChange={handleInputChange}
                    label="Transport Type"
                  >
                    <MenuItem value="walking">Walking</MenuItem>
                    <MenuItem value="bicycle">Bicycle</MenuItem>
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="public_transport">Public Transport</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="has_own_transport"
                      checked={formData.has_own_transport}
                      onChange={handleInputChange}
                    />
                  }
                  label="Has own reliable transport"
                  sx={{ mt: 2 }}
                />
              </Grid>
            </Grid>
          </Box>

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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>

          {/* Emergency Contact */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmergencyIcon color="error" />
              Emergency Contact
            </Box>
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
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
                label="Emergency Contact Phone"
                name="emergency_contact_phone"
                type="tel"
                value={formData.emergency_contact_phone}
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
          </Grid>
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
          {loading ? 'Creating...' : 'Create Worker'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWorkerModal;

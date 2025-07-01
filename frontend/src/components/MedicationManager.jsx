import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  IconButton,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Medication as MedicationIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { apiService } from '../services/api';

const MedicationManager = ({ open, onClose, client }) => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [newMedication, setNewMedication] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    instructions: '',
    prescriber_name: '',
    prescription_date: '',
    start_date: '',
    end_date: '',
    is_prn: false,
    prn_instructions: '',
    storage_instructions: '',
    side_effects: ''
  });

  const routeOptions = [
    { value: 'oral', label: 'Oral (by mouth)' },
    { value: 'topical', label: 'Topical (on skin)' },
    { value: 'injection', label: 'Injection' },
    { value: 'inhaler', label: 'Inhaler' },
    { value: 'drops', label: 'Drops' },
    { value: 'other', label: 'Other' }
  ];

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'Weekly',
    'As required (PRN)',
    'Other'
  ];

  useEffect(() => {
    console.log('MedicationManager useEffect triggered:', { open, client });
    if (open && client) {
      console.log('Loading medications for client:', client.id);
      loadMedications();
    } else {
      console.log('Not loading medications - open:', open, 'client:', client);
    }
  }, [open, client]);

  const loadMedications = async () => {
    try {
      console.log('loadMedications called for client:', client?.id);
      setLoading(true);
      setError('');
      const response = await apiService.get(`/clients/${client.id}/medications`);
      console.log('Medications API response:', response);
      if (response.success) {
        setMedications(response.data || []);
        console.log('Medications loaded:', response.data);
      }
    } catch (error) {
      console.error('Error loading medications:', error);
      setError('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async () => {
    try {
      setError('');
      
      if (!newMedication.medication_name || !newMedication.dosage || !newMedication.frequency || !newMedication.start_date) {
        setError('Please fill in all required fields');
        return;
      }

      const response = await apiService.post(`/clients/${client.id}/medications`, newMedication);
      if (response.success) {
        setAddDialogOpen(false);
        setNewMedication({
          medication_name: '',
          dosage: '',
          frequency: '',
          route: 'oral',
          instructions: '',
          prescriber_name: '',
          prescription_date: '',
          start_date: '',
          end_date: '',
          is_prn: false,
          prn_instructions: '',
          storage_instructions: '',
          side_effects: ''
        });
        loadMedications();
      }
    } catch (error) {
      console.error('Error adding medication:', error);
      setError('Failed to add medication');
    }
  };

  const handleEditMedication = (medication) => {
    setEditingMedication(medication);
    setNewMedication({
      ...medication,
      prescription_date: medication.prescription_date ? medication.prescription_date.split('T')[0] : '',
      start_date: medication.start_date ? medication.start_date.split('T')[0] : '',
      end_date: medication.end_date ? medication.end_date.split('T')[0] : ''
    });
    setAddDialogOpen(true);
  };

  const handleUpdateMedication = async () => {
    try {
      setError('');
      
      const response = await apiService.put(`/medications/${editingMedication.id}`, newMedication);
      if (response.success) {
        setAddDialogOpen(false);
        setEditingMedication(null);
        setNewMedication({
          medication_name: '',
          dosage: '',
          frequency: '',
          route: 'oral',
          instructions: '',
          prescriber_name: '',
          prescription_date: '',
          start_date: '',
          end_date: '',
          is_prn: false,
          prn_instructions: '',
          storage_instructions: '',
          side_effects: ''
        });
        loadMedications();
      }
    } catch (error) {
      console.error('Error updating medication:', error);
      setError('Failed to update medication');
    }
  };

  const handleDeleteMedication = async (medicationId) => {
    if (!window.confirm('Are you sure you want to remove this medication?')) {
      return;
    }

    try {
      setError('');
      const response = await apiService.delete(`/medications/${medicationId}`);
      if (response.success) {
        loadMedications();
      }
    } catch (error) {
      console.error('Error deleting medication:', error);
      setError('Failed to remove medication');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setEditingMedication(null);
    setNewMedication({
      medication_name: '',
      dosage: '',
      frequency: '',
      route: 'oral',
      instructions: '',
      prescriber_name: '',
      prescription_date: '',
      start_date: '',
      end_date: '',
      is_prn: false,
      prn_instructions: '',
      storage_instructions: '',
      side_effects: ''
    });
  };

  if (!client) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MedicationIcon />
            <Typography variant="h6">
              Medication Management - {client.first_name} {client.last_name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Current Medications ({medications.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add Medication
            </Button>
          </Box>

          {loading ? (
            <Typography>Loading medications...</Typography>
          ) : medications.length === 0 ? (
            <Card>
              <CardContent>
                <Typography color="text.secondary" textAlign="center">
                  No medications recorded for this client.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {medications.map((medication) => (
                <Grid item xs={12} md={6} key={medication.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" color="primary">
                          {medication.medication_name}
                        </Typography>
                        <Box>
                          <IconButton size="small" onClick={() => handleEditMedication(medication)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteMedication(medication.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={`${medication.dosage} - ${medication.frequency}`} 
                          color="primary" 
                          size="small" 
                          sx={{ mr: 1, mb: 1 }}
                        />
                        <Chip 
                          label={medication.route} 
                          variant="outlined" 
                          size="small" 
                          sx={{ mr: 1, mb: 1 }}
                        />
                        {medication.is_prn && (
                          <Chip 
                            label="PRN (As Required)" 
                            color="warning" 
                            size="small" 
                            sx={{ mb: 1 }}
                          />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Instructions:</strong> {medication.instructions || 'None specified'}
                      </Typography>

                      {medication.is_prn && medication.prn_instructions && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>PRN Instructions:</strong> {medication.prn_instructions}
                        </Typography>
                      )}

                      {medication.storage_instructions && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Storage:</strong> {medication.storage_instructions}
                        </Typography>
                      )}

                      {medication.side_effects && (
                        <Typography variant="body2" color="error" gutterBottom>
                          <WarningIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          <strong>Side Effects:</strong> {medication.side_effects}
                        </Typography>
                      )}

                      <Divider sx={{ my: 1 }} />

                      <Typography variant="caption" color="text.secondary">
                        <strong>Prescriber:</strong> {medication.prescriber_name || 'Not specified'}<br />
                        <strong>Start Date:</strong> {formatDate(medication.start_date)}<br />
                        {medication.end_date && (
                          <>
                            <strong>End Date:</strong> {formatDate(medication.end_date)}<br />
                          </>
                        )}
                        <strong>Added:</strong> {formatDate(medication.created_at)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Medication Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMedication ? 'Edit Medication' : 'Add New Medication'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Medication Name *"
                value={newMedication.medication_name}
                onChange={(e) => setNewMedication({ ...newMedication, medication_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dosage *"
                placeholder="e.g., 5mg, 10ml, 1 tablet"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency *</InputLabel>
                <Select
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                  label="Frequency *"
                >
                  {frequencyOptions.map((freq) => (
                    <MenuItem key={freq} value={freq}>{freq}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Route *</InputLabel>
                <Select
                  value={newMedication.route}
                  onChange={(e) => setNewMedication({ ...newMedication, route: e.target.value })}
                  label="Route *"
                >
                  {routeOptions.map((route) => (
                    <MenuItem key={route.value} value={route.value}>{route.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                placeholder="e.g., Take with food, Take on empty stomach, Take before bedtime"
                multiline
                rows={2}
                value={newMedication.instructions}
                onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prescriber Name"
                value={newMedication.prescriber_name}
                onChange={(e) => setNewMedication({ ...newMedication, prescriber_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prescription Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newMedication.prescription_date}
                onChange={(e) => setNewMedication({ ...newMedication, prescription_date: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date *"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newMedication.start_date}
                onChange={(e) => setNewMedication({ ...newMedication, start_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date (if applicable)"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newMedication.end_date}
                onChange={(e) => setNewMedication({ ...newMedication, end_date: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newMedication.is_prn}
                    onChange={(e) => setNewMedication({ ...newMedication, is_prn: e.target.checked })}
                  />
                }
                label="PRN (As Required) - Only give when needed"
              />
            </Grid>

            {newMedication.is_prn && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="PRN Instructions"
                  placeholder="e.g., For pain relief, maximum 4 times daily, wait 4 hours between doses"
                  multiline
                  rows={2}
                  value={newMedication.prn_instructions}
                  onChange={(e) => setNewMedication({ ...newMedication, prn_instructions: e.target.value })}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Storage Instructions"
                placeholder="e.g., Store in refrigerator, Keep in cool dry place"
                value={newMedication.storage_instructions}
                onChange={(e) => setNewMedication({ ...newMedication, storage_instructions: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Side Effects to Watch For"
                placeholder="e.g., Drowsiness, nausea, dizziness"
                value={newMedication.side_effects}
                onChange={(e) => setNewMedication({ ...newMedication, side_effects: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            onClick={editingMedication ? handleUpdateMedication : handleAddMedication}
            variant="contained"
          >
            {editingMedication ? 'Update' : 'Add'} Medication
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MedicationManager;

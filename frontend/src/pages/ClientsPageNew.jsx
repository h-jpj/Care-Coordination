import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Alert,
  IconButton,
  Chip,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Phone,
  LocationOn,
  Person,
  Assignment,
  CalendarToday,
  Medication
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import AddClientModal from '../components/AddClientModal';
import ClientTasksManager from '../components/ClientTasksManager';
import MedicationManager from '../components/MedicationManager';

const ClientsPageNew = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [tasksManagerOpen, setTasksManagerOpen] = useState(false);
  const [medicationManagerOpen, setMedicationManagerOpen] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    // Filter clients based on search term
    if (searchTerm) {
      const filtered = clients.filter(client =>
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.address_line1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.postal_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      setError('');
      const response = await apiService.getClients();
      if (response.success) {
        setClients(response.data || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleClientAdded = (newClient) => {
    setClients(prev => [...prev, newClient]);
    setAddClientModalOpen(false);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };

  const handleManageTasks = (client) => {
    setSelectedClient(client);
    setTasksManagerOpen(true);
  };

  const handleManageMedications = (client) => {
    setSelectedClient(client);
    setMedicationManagerOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getAgeFromDOB = (dob) => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="400px">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <Typography sx={{ ml: 2 }}>Loading clients...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Client Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddClientModalOpen(true)}
          sx={{ bgcolor: 'primary.main' }}
        >
          Add New Client
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search clients by name, address, or postal code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Clients List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Clients ({filteredClients.length})
              </Typography>
              <List>
                {filteredClients.map((client, index) => (
                  <React.Fragment key={client.id}>
                    <ListItem
                      button
                      onClick={() => handleClientSelect(client)}
                      selected={selectedClient?.id === client.id}
                    >
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${client.first_name} ${client.last_name}`}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Age: {getAgeFromDOB(client.date_of_birth)} • {client.sex || 'N/A'}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {client.city}, {client.postal_code}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < filteredClients.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              {filteredClients.length === 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  {searchTerm ? 'No clients found matching your search.' : 'No clients found.'}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Client Details */}
        <Grid item xs={12} md={8}>
          {selectedClient ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {selectedClient.first_name} {selectedClient.last_name}
                      {selectedClient.preferred_name && (
                        <Typography variant="subtitle1" color="textSecondary" component="span" sx={{ ml: 1 }}>
                          ({selectedClient.preferred_name})
                        </Typography>
                      )}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        label={`Age: ${getAgeFromDOB(selectedClient.date_of_birth)}`} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={selectedClient.sex || 'N/A'} 
                        size="small" 
                        variant="outlined" 
                      />
                      {selectedClient.funding_source && (
                        <Chip 
                          label={selectedClient.funding_source.replace('_', ' ').toUpperCase()} 
                          size="small" 
                          color="primary" 
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<Assignment />}
                      onClick={() => handleManageTasks(selectedClient)}
                      size="small"
                    >
                      Manage Tasks
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Medication />}
                      onClick={() => handleManageMedications(selectedClient)}
                      size="small"
                      color="secondary"
                    >
                      Medications
                    </Button>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  {/* Contact Information */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Contact Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">Address</Typography>
                      <Typography variant="body1">
                        {selectedClient.address_line1}
                        {selectedClient.address_line2 && <><br />{selectedClient.address_line2}</>}
                        <br />{selectedClient.city}, {selectedClient.postal_code}
                      </Typography>
                    </Box>
                    {selectedClient.phone && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">Phone</Typography>
                        <Typography variant="body1">{selectedClient.phone}</Typography>
                      </Box>
                    )}
                    {selectedClient.mobile && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">Mobile</Typography>
                        <Typography variant="body1">{selectedClient.mobile}</Typography>
                      </Box>
                    )}
                    {selectedClient.nhs_number && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">NHS Number</Typography>
                        <Typography variant="body1">{selectedClient.nhs_number}</Typography>
                      </Box>
                    )}
                  </Grid>

                  {/* Care Information */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Care Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">Service Start Date</Typography>
                      <Typography variant="body1">{formatDate(selectedClient.service_start_date)}</Typography>
                    </Box>
                    {selectedClient.mobility_level && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">Mobility Level</Typography>
                        <Typography variant="body1">
                          {selectedClient.mobility_level.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Box>
                    )}
                    {selectedClient.cognitive_status && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">Cognitive Status</Typography>
                        <Typography variant="body1">
                          {selectedClient.cognitive_status.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Box>
                    )}
                    {selectedClient.fall_risk && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">Fall Risk</Typography>
                        <Chip 
                          label={selectedClient.fall_risk.toUpperCase()} 
                          size="small"
                          color={selectedClient.fall_risk === 'high' ? 'error' : selectedClient.fall_risk === 'medium' ? 'warning' : 'success'}
                        />
                      </Box>
                    )}
                  </Grid>

                  {/* Medical Information */}
                  {(selectedClient.medical_conditions || selectedClient.allergies || selectedClient.dietary_requirements) && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Medical Information
                      </Typography>
                      {selectedClient.medical_conditions && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">Medical Conditions</Typography>
                          <Typography variant="body1">{selectedClient.medical_conditions}</Typography>
                        </Box>
                      )}
                      {selectedClient.allergies && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">Allergies</Typography>
                          <Typography variant="body1">{selectedClient.allergies}</Typography>
                        </Box>
                      )}
                      {selectedClient.dietary_requirements && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">Dietary Requirements</Typography>
                          <Typography variant="body1">{selectedClient.dietary_requirements}</Typography>
                        </Box>
                      )}
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  Select a client to view details
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={addClientModalOpen}
        onClose={() => setAddClientModalOpen(false)}
        onClientAdded={handleClientAdded}
      />

      {/* Client Tasks Manager */}
      <ClientTasksManager
        clientId={selectedClient?.id}
        isOpen={tasksManagerOpen}
        onClose={() => setTasksManagerOpen(false)}
      />

      {/* Medication Manager */}
      <MedicationManager
        open={medicationManagerOpen}
        onClose={() => setMedicationManagerOpen(false)}
        client={selectedClient}
      />
    </Container>
  );
};

export default ClientsPageNew;

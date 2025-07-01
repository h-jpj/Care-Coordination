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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Search, Edit, Delete, Phone, LocationOn } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Client } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ClientsPage: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<Partial<Client>>({});

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    // Filter clients based on search term
    if (searchTerm) {
      const filtered = clients.filter(client =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.addressLine1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.postalCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [clients, searchTerm]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await apiService.getClients();
      if (response.success) {
        setClients(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    try {
      if (!newClient.firstName || !newClient.lastName || !newClient.addressLine1 || !newClient.city || !newClient.postalCode) {
        setError('Please fill in all required fields');
        return;
      }

      const response = await apiService.createClient(newClient);
      if (response.success) {
        setCreateDialogOpen(false);
        setNewClient({});
        loadClients();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
    }
  };

  const handleUpdateClient = async () => {
    try {
      if (!selectedClient) return;

      const response = await apiService.updateClient(selectedClient.id, selectedClient);
      if (response.success) {
        setEditDialogOpen(false);
        setSelectedClient(null);
        loadClients();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update client');
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    try {
      if (window.confirm('Are you sure you want to deactivate this client?')) {
        const response = await apiService.deleteClient(clientId);
        if (response.success) {
          loadClients();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate client');
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient({ ...client });
    setEditDialogOpen(true);
  };

  if (loading) {
    return <LoadingSpinner message="Loading clients..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Clients</Typography>
        {user?.role === 'office_worker' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add Client
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" textAlign="center">
              {searchTerm ? 'No clients found matching your search.' : 'No clients found.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredClients.map((client) => (
            <Grid item xs={12} md={6} lg={4} key={client.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">
                      {client.firstName} {client.lastName}
                    </Typography>
                    <Box>
                      <Chip 
                        label={client.isActive ? 'Active' : 'Inactive'} 
                        color={client.isActive ? 'success' : 'default'}
                        size="small"
                      />
                      {user?.role === 'office_worker' && (
                        <Box sx={{ mt: 1 }}>
                          <IconButton size="small" onClick={() => openEditDialog(client)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteClient(client.id)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 1, mt: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {client.addressLine1}
                      {client.addressLine2 && `, ${client.addressLine2}`}
                      <br />
                      {client.city}, {client.postalCode}
                    </Typography>
                  </Box>
                  
                  {client.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {client.phone}
                      </Typography>
                    </Box>
                  )}
                  
                  {client.emergencyContactName && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Emergency Contact:</strong> {client.emergencyContactName}
                      {client.emergencyContactPhone && ` (${client.emergencyContactPhone})`}
                    </Typography>
                  )}
                  
                  {client.specialInstructions && (
                    <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                      <strong>Special Instructions:</strong> {client.specialInstructions}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Client Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newClient.firstName || ''}
                onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newClient.lastName || ''}
                onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={newClient.addressLine1 || ''}
                onChange={(e) => setNewClient({ ...newClient, addressLine1: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={newClient.addressLine2 || ''}
                onChange={(e) => setNewClient({ ...newClient, addressLine2: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={newClient.city || ''}
                onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={newClient.postalCode || ''}
                onChange={(e) => setNewClient({ ...newClient, postalCode: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={newClient.phone || ''}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                value={newClient.emergencyContactName || ''}
                onChange={(e) => setNewClient({ ...newClient, emergencyContactName: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                value={newClient.emergencyContactPhone || ''}
                onChange={(e) => setNewClient({ ...newClient, emergencyContactPhone: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Instructions"
                multiline
                rows={3}
                value={newClient.specialInstructions || ''}
                onChange={(e) => setNewClient({ ...newClient, specialInstructions: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateClient} variant="contained">Add Client</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          {selectedClient && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={selectedClient.firstName || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, firstName: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={selectedClient.lastName || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, lastName: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  value={selectedClient.addressLine1 || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, addressLine1: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  value={selectedClient.addressLine2 || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, addressLine2: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={selectedClient.city || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, city: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={selectedClient.postalCode || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, postalCode: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={selectedClient.phone || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, phone: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  value={selectedClient.emergencyContactName || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, emergencyContactName: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Phone"
                  value={selectedClient.emergencyContactPhone || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, emergencyContactPhone: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Instructions"
                  multiline
                  rows={3}
                  value={selectedClient.specialInstructions || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, specialInstructions: e.target.value })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateClient} variant="contained">Update Client</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

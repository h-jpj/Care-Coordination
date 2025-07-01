import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import { Add as AddIcon, Group as GroupIcon } from '@mui/icons-material';
import AddClientModal from '../components/AddClientModal';
import { api } from '../services/api';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      if (response.data.success) {
        setClients(response.data.data);
      }
    } catch (error) {
      setError('Failed to fetch clients');
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientAdded = () => {
    fetchClients();
    setModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Clients Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Add Client
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading clients...</Typography>
      ) : (
        <Grid container spacing={3}>
          {clients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {client.first_name} {client.last_name}
                    </Typography>
                  </Box>
                  {client.preferred_name && (
                    <Typography color="text.secondary" gutterBottom>
                      Preferred: {client.preferred_name}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    DOB: {client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'Not provided'}
                  </Typography>
                  {client.phone && (
                    <Typography variant="body2">
                      Phone: {client.phone}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <AddClientModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onClientAdded={handleClientAdded}
      />
    </Box>
  );
};

export default ClientsPage;

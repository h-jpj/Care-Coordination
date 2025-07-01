import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Add, Search, FilterList } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Job, Client, User, CreateJobData } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState<Date | null>(new Date());
  const [filterWorker, setFilterWorker] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState<Partial<CreateJobData>>({
    priority: 'medium',
    durationMinutes: 60,
  });

  useEffect(() => {
    loadJobs();
    if (user?.role === 'office_worker') {
      loadClients();
      loadWorkers();
    }
  }, [user, filterStatus, filterDate, filterWorker]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.date = filterDate.toISOString().split('T')[0];
      if (filterWorker) params.workerId = filterWorker;

      const response = await apiService.getJobs(params);
      if (response.success) {
        setJobs(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await apiService.getClients({ active: true });
      if (response.success) {
        setClients(response.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load clients:', err);
    }
  };

  const loadWorkers = async () => {
    try {
      const response = await apiService.getWorkers();
      if (response.success) {
        setWorkers(response.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load workers:', err);
    }
  };

  const handleCreateJob = async () => {
    try {
      if (!newJob.clientId || !newJob.title || !newJob.scheduledStartTime || !newJob.scheduledEndTime) {
        setError('Please fill in all required fields');
        return;
      }

      const response = await apiService.createJob(newJob);
      if (response.success) {
        setCreateDialogOpen(false);
        setNewJob({ priority: 'medium', durationMinutes: 60 });
        loadJobs();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'late': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'late': return 'Late';
      default: return status;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading jobs..." />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Jobs</Typography>
          {user?.role === 'office_worker' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Job
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="assigned">Assigned</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="late">Late</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Date"
                  value={filterDate}
                  onChange={(newValue) => setFilterDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              {user?.role === 'office_worker' && (
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Worker</InputLabel>
                    <Select
                      value={filterWorker}
                      label="Worker"
                      onChange={(e) => setFilterWorker(e.target.value)}
                    >
                      <MenuItem value="">All Workers</MenuItem>
                      {workers.map((worker) => (
                        <MenuItem key={worker.id} value={worker.id}>
                          {worker.firstName} {worker.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => {
                    setFilterStatus('');
                    setFilterDate(new Date());
                    setFilterWorker('');
                  }}
                  fullWidth
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card>
            <CardContent>
              <Typography color="text.secondary" textAlign="center">
                No jobs found for the selected filters.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {jobs.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { elevation: 4 }
                  }}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" noWrap>
                        {job.title}
                      </Typography>
                      <Chip 
                        label={getStatusLabel(job.status)} 
                        color={getStatusColor(job.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Client:</strong> {job.client.firstName} {job.client.lastName}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Address:</strong> {job.client.addressLine1}, {job.client.city}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Time:</strong> {new Date(job.scheduledStartTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {new Date(job.scheduledEndTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Duration:</strong> {job.durationMinutes} minutes
                    </Typography>
                    
                    {job.worker ? (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Worker:</strong> {job.worker.firstName} {job.worker.lastName}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="warning.main">
                        <strong>Unassigned</strong>
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Job Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Title"
                  value={newJob.title || ''}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Client</InputLabel>
                  <Select
                    value={newJob.clientId || ''}
                    label="Client"
                    onChange={(e) => setNewJob({ ...newJob, clientId: Number(e.target.value) })}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName} - {client.addressLine1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assign Worker</InputLabel>
                  <Select
                    value={newJob.assignedWorkerId || ''}
                    label="Assign Worker"
                    onChange={(e) => setNewJob({ ...newJob, assignedWorkerId: Number(e.target.value) || undefined })}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {workers.map((worker) => (
                      <MenuItem key={worker.id} value={worker.id}>
                        {worker.firstName} {worker.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="datetime-local"
                  value={newJob.scheduledStartTime || ''}
                  onChange={(e) => setNewJob({ ...newJob, scheduledStartTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="datetime-local"
                  value={newJob.scheduledEndTime || ''}
                  onChange={(e) => setNewJob({ ...newJob, scheduledEndTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={newJob.durationMinutes || ''}
                  onChange={(e) => setNewJob({ ...newJob, durationMinutes: Number(e.target.value) })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newJob.priority || 'medium'}
                    label="Priority"
                    onChange={(e) => setNewJob({ ...newJob, priority: e.target.value as any })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={newJob.description || ''}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateJob} variant="contained">Create Job</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

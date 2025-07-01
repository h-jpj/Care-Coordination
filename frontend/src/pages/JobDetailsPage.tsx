import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  LocationOn,
  Person,
  Schedule,
  Note,
  Add,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Job, Note as NoteType, LocationLog, User, CreateNoteData } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationLog[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editedJob, setEditedJob] = useState<Partial<Job>>({});
  const [newNote, setNewNote] = useState<Partial<CreateNoteData>>({
    noteType: 'care_note',
    isPrivate: false,
  });

  useEffect(() => {
    if (id) {
      loadJobDetails();
      loadJobNotes();
      loadLocationHistory();
      if (user?.role === 'office_worker') {
        loadWorkers();
      }
    }
  }, [id, user]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJob(Number(id));
      if (response.success) {
        setJob(response.data);
        setEditedJob(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const loadJobNotes = async () => {
    try {
      const response = await apiService.getJobNotes(Number(id));
      if (response.success) {
        setNotes(response.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load notes:', err);
    }
  };

  const loadLocationHistory = async () => {
    try {
      const response = await apiService.getJobLocationHistory(Number(id));
      if (response.success) {
        setLocationHistory(response.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load location history:', err);
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

  const handleUpdateJob = async () => {
    try {
      const response = await apiService.updateJob(Number(id), editedJob);
      if (response.success) {
        setEditDialogOpen(false);
        loadJobDetails();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update job');
    }
  };

  const handleAddNote = async () => {
    try {
      if (!newNote.content) {
        setError('Note content is required');
        return;
      }

      const noteData = {
        ...newNote,
        jobId: Number(id),
      } as CreateNoteData;

      const response = await apiService.createNote(noteData);
      if (response.success) {
        setNoteDialogOpen(false);
        setNewNote({ noteType: 'care_note', isPrivate: false });
        loadJobNotes();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add note');
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
    return <LoadingSpinner message="Loading job details..." />;
  }

  if (!job) {
    return (
      <Box>
        <Alert severity="error">Job not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/jobs')}
          sx={{ mr: 2 }}
        >
          Back to Jobs
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {job.title}
        </Typography>
        {user?.role === 'office_worker' && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditDialogOpen(true)}
          >
            Edit Job
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Job Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Job Details</Typography>
                <Chip 
                  label={getStatusLabel(job.status)} 
                  color={getStatusColor(job.status) as any}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2">Client</Typography>
                      <Typography variant="body2">
                        {job.client.firstName} {job.client.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2">Address</Typography>
                      <Typography variant="body2">
                        {job.client.addressLine1}
                        {job.client.addressLine2 && `, ${job.client.addressLine2}`}
                        <br />
                        {job.client.city}, {job.client.postalCode}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2">Scheduled Time</Typography>
                      <Typography variant="body2">
                        {new Date(job.scheduledStartTime).toLocaleString()} - {new Date(job.scheduledEndTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {job.durationMinutes} minutes
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2">Assigned Worker</Typography>
                      <Typography variant="body2">
                        {job.worker ? `${job.worker.firstName} ${job.worker.lastName}` : 'Unassigned'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {job.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Description</Typography>
                    <Typography variant="body2">{job.description}</Typography>
                  </Grid>
                )}

                {job.client.specialInstructions && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Special Instructions</Typography>
                    <Typography variant="body2" color="warning.main">
                      {job.client.specialInstructions}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Notes</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setNoteDialogOpen(true)}
                  size="small"
                >
                  Add Note
                </Button>
              </Box>

              {notes.length === 0 ? (
                <Typography color="text.secondary">No notes yet.</Typography>
              ) : (
                <List>
                  {notes.map((note, index) => (
                    <React.Fragment key={note.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {note.author.firstName[0]}{note.author.lastName[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2">
                                {note.author.firstName} {note.author.lastName}
                              </Typography>
                              <Chip 
                                label={note.noteType.replace('_', ' ')} 
                                size="small" 
                                variant="outlined"
                              />
                              {note.isPrivate && (
                                <Chip label="Private" size="small" color="warning" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {note.content}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(note.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < notes.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Location History */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Location History</Typography>
              
              {locationHistory.length === 0 ? (
                <Typography color="text.secondary">No location data yet.</Typography>
              ) : (
                <List dense>
                  {locationHistory.map((log) => (
                    <ListItem key={log.id}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            {log.actionType === 'check_in' ? 'Checked In' : 'Checked Out'}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {log.user.firstName} {log.user.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(log.timestamp).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Job Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Job</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                value={editedJob.title || ''}
                onChange={(e) => setEditedJob({ ...editedJob, title: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editedJob.status || ''}
                  label="Status"
                  onChange={(e) => setEditedJob({ ...editedJob, status: e.target.value as any })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="assigned">Assigned</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assign Worker</InputLabel>
                <Select
                  value={editedJob.assignedWorkerId || ''}
                  label="Assign Worker"
                  onChange={(e) => setEditedJob({ ...editedJob, assignedWorkerId: Number(e.target.value) || undefined })}
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={editedJob.description || ''}
                onChange={(e) => setEditedJob({ ...editedJob, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateJob} variant="contained">Update Job</Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Note Type</InputLabel>
                <Select
                  value={newNote.noteType || 'care_note'}
                  label="Note Type"
                  onChange={(e) => setNewNote({ ...newNote, noteType: e.target.value as any })}
                >
                  <MenuItem value="care_note">Care Note</MenuItem>
                  {user?.role === 'office_worker' && (
                    <>
                      <MenuItem value="internal_note">Internal Note</MenuItem>
                      <MenuItem value="incident_report">Incident Report</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Note Content"
                multiline
                rows={4}
                value={newNote.content || ''}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained">Add Note</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

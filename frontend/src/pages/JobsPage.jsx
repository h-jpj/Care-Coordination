import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Route as RouteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { apiService } from '../services/api'

const JobsPage = () => {
  const [jobs, setJobs] = useState([])
  const [clients, setClients] = useState([])
  const [workers, setWorkers] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [optimizing, setOptimizing] = useState(false)

  // New job form state
  const [newJob, setNewJob] = useState({
    client_id: '',
    assigned_worker_id: '',
    title: '',
    description: '',
    scheduled_start_time: '',
    scheduled_end_time: '',
    duration_minutes: 30,
    priority: 'medium',
    job_type: 'regular'
  })

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const loadData = async () => {
    try {
      setError('')
      setLoading(true)

      const dateStr = selectedDate.toISOString().split('T')[0]
      const [jobsResponse, clientsResponse, workersResponse] = await Promise.all([
        apiService.getJobs({ date: dateStr }),
        apiService.getClients(),
        apiService.getWorkers()
      ])

      if (jobsResponse.success) {
        setJobs(jobsResponse.data || [])
      }
      if (clientsResponse.success) {
        setClients(clientsResponse.data || [])
      }
      if (workersResponse.success) {
        setWorkers(workersResponse.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load jobs data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateJob = async () => {
    try {
      setError('')

      // Validate required fields
      if (!newJob.client_id || !newJob.assigned_worker_id || !newJob.title ||
          !newJob.scheduled_start_time || !newJob.scheduled_end_time) {
        setError('Please fill in all required fields')
        return
      }

      const response = await apiService.createJob(newJob)
      if (response.success) {
        setCreateDialogOpen(false)
        setNewJob({
          client_id: '',
          assigned_worker_id: '',
          title: '',
          description: '',
          scheduled_start_time: '',
          scheduled_end_time: '',
          duration_minutes: 30,
          priority: 'medium',
          job_type: 'regular'
        })
        loadData() // Reload jobs
      }
    } catch (error) {
      console.error('Error creating job:', error)
      if (error.response?.status === 409) {
        setError('Scheduling conflict detected. Please choose a different time.')
      } else {
        setError('Failed to create job')
      }
    }
  }

  const handleOptimizeSchedule = async () => {
    try {
      setOptimizing(true)
      setError('')

      const workerIds = [...new Set(jobs.map(job => job.assigned_worker_id).filter(Boolean))]
      const dateStr = selectedDate.toISOString().split('T')[0]

      const response = await apiService.api.post('/schedule/optimize', {
        date: dateStr,
        worker_ids: workerIds
      })

      if (response.data.success) {
        // Reload jobs to see optimized schedule
        loadData()
        alert('Schedule optimized successfully!')
      }
    } catch (error) {
      console.error('Error optimizing schedule:', error)
      setError('Failed to optimize schedule')
    } finally {
      setOptimizing(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'assigned': return 'info'
      case 'confirmed': return 'info'
      case 'in_progress': return 'primary'
      case 'completed': return 'success'
      case 'cancelled': return 'error'
      case 'late': return 'error'
      case 'missed': return 'error'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error'
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  const formatTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const groupJobsByWorker = () => {
    const grouped = {}
    jobs.forEach(job => {
      const workerId = job.assigned_worker_id || 'unassigned'
      if (!grouped[workerId]) {
        grouped[workerId] = {
          worker: job.worker_first_name && job.worker_last_name
            ? { first_name: job.worker_first_name, last_name: job.worker_last_name }
            : null,
          jobs: []
        }
      }
      grouped[workerId].jobs.push(job)
    })
    return grouped
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading jobs...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Job Scheduling & Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Select Date"
            type="date"
            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadData}
              variant="outlined"
              size="small"
            >
              Refresh
            </Button>
            <Button
              startIcon={<RouteIcon />}
              onClick={handleOptimizeSchedule}
              variant="outlined"
              size="small"
              disabled={optimizing || jobs.length === 0}
            >
              {optimizing ? 'Optimizing...' : 'Optimize Routes'}
            </Button>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              variant="contained"
              size="small"
            >
              Schedule Job
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label={`All Jobs (${jobs.length})`} />
          <Tab label="By Worker" />
          <Tab label="Timeline View" />
        </Tabs>

        {/* All Jobs Tab */}
        {tabValue === 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Jobs for {selectedDate.toLocaleDateString()}
              </Typography>
              {jobs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography color="textSecondary">
                    No jobs scheduled for this date
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Client</TableCell>
                        <TableCell>Worker</TableCell>
                        <TableCell>Job Details</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {formatTime(job.scheduled_start_time)} - {formatTime(job.scheduled_end_time)}
                              </Typography>
                              {job.travel_time_before_minutes > 0 && (
                                <Typography variant="caption" color="textSecondary">
                                  +{job.travel_time_before_minutes}m travel
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {job.client_preferred_name || job.client_first_name} {job.client_last_name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {job.address_line1}, {job.city}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {job.worker_first_name ? (
                              <Box>
                                <Typography variant="body2">
                                  {job.worker_first_name} {job.worker_last_name}
                                </Typography>
                              </Box>
                            ) : (
                              <Chip label="Unassigned" color="warning" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {job.title}
                              </Typography>
                              {job.plan_name && (
                                <Typography variant="caption" color="textSecondary">
                                  {job.plan_name}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {formatDuration(job.duration_minutes)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={job.status}
                              color={getStatusColor(job.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={job.priority}
                              color={getPriorityColor(job.priority)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Edit Job">
                                <IconButton size="small">
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Job">
                                <IconButton size="small" color="error">
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* By Worker Tab */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            {Object.entries(groupJobsByWorker()).map(([workerId, workerData]) => (
              <Grid item xs={12} md={6} lg={4} key={workerId}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PersonIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {workerData.worker
                          ? `${workerData.worker.first_name} ${workerData.worker.last_name}`
                          : 'Unassigned Jobs'
                        }
                      </Typography>
                      <Chip
                        label={workerData.jobs.length}
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    {workerData.jobs.map((job) => (
                      <Box key={job.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {formatTime(job.scheduled_start_time)} - {formatTime(job.scheduled_end_time)}
                          </Typography>
                          <Chip
                            label={job.status}
                            color={getStatusColor(job.status)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2">
                          {job.client_preferred_name || job.client_first_name} {job.client_last_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {job.title}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Timeline View Tab */}
        {tabValue === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Timeline View - Coming Soon
              </Typography>
              <Typography color="textSecondary">
                Interactive timeline view with drag-and-drop scheduling will be available in the next update.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Create Job Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Schedule New Job</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Client</InputLabel>
                  <Select
                    value={newJob.client_id}
                    onChange={(e) => setNewJob({ ...newJob, client_id: e.target.value })}
                    label="Client"
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name} - {client.address_line1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Worker</InputLabel>
                  <Select
                    value={newJob.assigned_worker_id}
                    onChange={(e) => setNewJob({ ...newJob, assigned_worker_id: e.target.value })}
                    label="Worker"
                  >
                    {workers.map((worker) => (
                      <MenuItem key={worker.id} value={worker.id}>
                        {worker.first_name} {worker.last_name} ({worker.role})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="datetime-local"
                  value={newJob.scheduled_start_time}
                  onChange={(e) => setNewJob({ ...newJob, scheduled_start_time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="datetime-local"
                  value={newJob.scheduled_end_time}
                  onChange={(e) => setNewJob({ ...newJob, scheduled_end_time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={newJob.duration_minutes}
                  onChange={(e) => setNewJob({ ...newJob, duration_minutes: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newJob.priority}
                    onChange={(e) => setNewJob({ ...newJob, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    value={newJob.job_type}
                    onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                    label="Job Type"
                  >
                    <MenuItem value="regular">Regular</MenuItem>
                    <MenuItem value="one_off">One-off</MenuItem>
                    <MenuItem value="assessment">Assessment</MenuItem>
                    <MenuItem value="emergency">Emergency</MenuItem>
                    <MenuItem value="respite">Respite</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateJob} variant="contained">Schedule Job</Button>
          </DialogActions>
        </Dialog>
      </Container>
  )
}

export default JobsPage

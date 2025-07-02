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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material'
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { apiService } from '../services/api'
import AddWorkerModal from '../components/AddWorkerModal'

const WorkersPage = () => {
  const [workers, setWorkers] = useState([])
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [workerDetails, setWorkerDetails] = useState(null)
  const [qualifications, setQualifications] = useState([])
  const [availability, setAvailability] = useState([])
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addWorkerModalOpen, setAddWorkerModalOpen] = useState(false)

  useEffect(() => {
    loadWorkers()
  }, [])

  const loadWorkers = async () => {
    try {
      setError('')
      const response = await apiService.getWorkers()
      if (response.success) {
        setWorkers(response.data || [])
      }
    } catch (error) {
      console.error('Error loading workers:', error)
      setError('Failed to load workers')
    } finally {
      setLoading(false)
    }
  }

  const loadWorkerDetails = async (workerId) => {
    try {
      setDetailsLoading(true)
      setError('')

      const [qualResponse, availResponse, perfResponse] = await Promise.all([
        apiService.api.get(`/workers/${workerId}/qualifications`),
        apiService.api.get(`/workers/${workerId}/availability`),
        apiService.api.get(`/workers/${workerId}/performance`)
      ])

      if (qualResponse.data.success) {
        setQualifications(qualResponse.data.data || [])
      }
      if (availResponse.data.success) {
        setAvailability(availResponse.data.data || [])
      }
      if (perfResponse.data.success) {
        setPerformance(perfResponse.data.data)
      }
    } catch (error) {
      console.error('Error loading worker details:', error)
      setError('Failed to load worker details')
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleWorkerSelect = (worker) => {
    setSelectedWorker(worker)
    setWorkerDetails(worker)
    setTabValue(0)
    loadWorkerDetails(worker.id)
  }

  const getQualificationStatus = (qualification) => {
    const today = new Date()
    const expiryDate = new Date(qualification.expiry_date)
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return { status: 'expired', color: 'error', text: 'Expired' }
    if (daysUntilExpiry <= 30) return { status: 'expiring', color: 'warning', text: `Expires in ${daysUntilExpiry} days` }
    return { status: 'current', color: 'success', text: 'Current' }
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading workers...</Typography>
        </Box>
      </Container>
    )
  }

  const handleWorkerAdded = (newWorker) => {
    setWorkers(prev => [...prev, newWorker])
    setAddWorkerModalOpen(false)
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Worker Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddWorkerModalOpen(true)}
          sx={{ bgcolor: 'primary.main' }}
        >
          Add New Worker
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Workers List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Workers ({workers.length})
              </Typography>
              <List>
                {workers.map((worker, index) => (
                  <React.Fragment key={worker.id}>
                    <ListItem
                      button
                      onClick={() => handleWorkerSelect(worker)}
                      selected={selectedWorker?.id === worker.id}
                    >
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${worker.first_name} ${worker.last_name}`}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {worker.role.replace('_', ' ').toUpperCase()}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {worker.employment_type.replace('_', ' ')} • {
                                worker.transport_type ?
                                  worker.transport_type.charAt(0).toUpperCase() + worker.transport_type.slice(1).replace('_', ' ') :
                                  'No transport'
                              }
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < workers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Worker Details */}
        <Grid item xs={12} md={8}>
          {selectedWorker ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedWorker.first_name} {selectedWorker.last_name}
                </Typography>

                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                  <Tab label="Overview" />
                  <Tab label="Qualifications" />
                  <Tab label="Availability" />
                  <Tab label="Performance" />
                </Tabs>

                {detailsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {/* Overview Tab */}
                    {tabValue === 0 && (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">Employee ID</Typography>
                          <Typography variant="body1">{selectedWorker.employee_id}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                          <Typography variant="body1">{selectedWorker.email}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                          <Typography variant="body1">{selectedWorker.phone}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">Mobile</Typography>
                          <Typography variant="body1">{selectedWorker.mobile}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">Role</Typography>
                          <Typography variant="body1">{selectedWorker.role.replace('_', ' ').toUpperCase()}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">Employment Type</Typography>
                          <Typography variant="body1">{selectedWorker.employment_type.replace('_', ' ')}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">Max Clients/Day</Typography>
                          <Typography variant="body1">{selectedWorker.max_clients_per_day}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">Transport</Typography>
                          <Typography variant="body1">
                            {selectedWorker.transport_type ?
                              selectedWorker.transport_type.charAt(0).toUpperCase() + selectedWorker.transport_type.slice(1).replace('_', ' ') :
                              'Not specified'
                            }
                            {selectedWorker.has_own_transport && ' (Own transport)'}
                          </Typography>
                        </Grid>
                      </Grid>
                    )}

                    {/* Qualifications Tab */}
                    {tabValue === 1 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">Qualifications & Certifications</Typography>
                          <Button startIcon={<AddIcon />} variant="outlined" size="small">
                            Add Qualification
                          </Button>
                        </Box>
                        {qualifications.length === 0 ? (
                          <Typography color="textSecondary">No qualifications recorded</Typography>
                        ) : (
                          <List>
                            {qualifications.map((qual, index) => {
                              const statusInfo = getQualificationStatus(qual)
                              return (
                                <React.Fragment key={qual.id}>
                                  <ListItem>
                                    <ListItemIcon>
                                      <SchoolIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={qual.qualification_name}
                                      secondary={
                                        <Box>
                                          <Typography variant="caption" display="block">
                                            {qual.issuing_body} • Issued: {new Date(qual.issue_date).toLocaleDateString()}
                                          </Typography>
                                          <Typography variant="caption" display="block">
                                            Expires: {new Date(qual.expiry_date).toLocaleDateString()}
                                          </Typography>
                                        </Box>
                                      }
                                    />
                                    <Chip
                                      label={statusInfo.text}
                                      color={statusInfo.color}
                                      size="small"
                                    />
                                  </ListItem>
                                  {index < qualifications.length - 1 && <Divider />}
                                </React.Fragment>
                              )
                            })}
                          </List>
                        )}
                      </Box>
                    )}

                    {/* Availability Tab */}
                    {tabValue === 2 && (
                      <Box>
                        <Typography variant="h6" gutterBottom>Weekly Availability</Typography>
                        {availability.length === 0 ? (
                          <Typography color="textSecondary">No availability set</Typography>
                        ) : (
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Day</TableCell>
                                  <TableCell>Start Time</TableCell>
                                  <TableCell>End Time</TableCell>
                                  <TableCell>Available</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {availability.map((avail) => (
                                  <TableRow key={avail.id}>
                                    <TableCell>{avail.day_of_week.charAt(0).toUpperCase() + avail.day_of_week.slice(1)}</TableCell>
                                    <TableCell>{formatTime(avail.start_time)}</TableCell>
                                    <TableCell>{formatTime(avail.end_time)}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={avail.is_available ? 'Available' : 'Not Available'}
                                        color={avail.is_available ? 'success' : 'default'}
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Box>
                    )}

                    {/* Performance Tab */}
                    {tabValue === 3 && performance && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Performance Metrics (Last 30 Days)
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                              <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">
                                  {performance.total_jobs}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Total Jobs
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                              <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main">
                                  {performance.completed_jobs}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Completed
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                              <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="warning.main">
                                  {performance.late_jobs}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Late Arrivals
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                              <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="error.main">
                                  {performance.missed_jobs}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Missed Calls
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Card variant="outlined">
                              <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4">
                                  {Math.round(performance.avg_visit_duration || 0)}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Avg Visit Duration (mins)
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Card variant="outlined">
                              <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4">
                                  {performance.unique_clients_served}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Unique Clients Served
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  Select a worker to view details
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Add Worker Modal */}
      <AddWorkerModal
        isOpen={addWorkerModalOpen}
        onClose={() => setAddWorkerModalOpen(false)}
        onWorkerAdded={handleWorkerAdded}
      />
    </Container>
  )
}

export default WorkersPage

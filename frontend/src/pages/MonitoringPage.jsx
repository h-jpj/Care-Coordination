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
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material'
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  LocalHospital as EmergencyIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material'
import { apiService } from '../services/api'

const MonitoringPage = () => {
  const [workerLocations, setWorkerLocations] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    loadMonitoringData()
    // Refresh data every 30 seconds
    const interval = setInterval(loadMonitoringData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadMonitoringData = async () => {
    try {
      setError('')
      const [locationsResponse, alertsResponse] = await Promise.all([
        apiService.api.get('/location/workers'),
        apiService.getAlerts({ status: 'active', limit: 20 })
      ])

      if (locationsResponse.data.success) {
        setWorkerLocations(locationsResponse.data.data || [])
      }
      if (alertsResponse.success) {
        setActiveAlerts(alertsResponse.data || [])
      }
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading monitoring data:', error)
      setError('Failed to load monitoring data')
    } finally {
      setLoading(false)
    }
  }

  const getWorkerStatusColor = (worker) => {
    if (!worker.latitude || !worker.longitude) return 'default'
    
    const lastUpdate = new Date(worker.timestamp)
    const now = new Date()
    const minutesSinceUpdate = (now - lastUpdate) / (1000 * 60)

    if (minutesSinceUpdate > 60) return 'error' // No update for over 1 hour
    if (minutesSinceUpdate > 30) return 'warning' // No update for over 30 minutes
    if (worker.job_status === 'in_progress') return 'success'
    if (worker.job_status === 'assigned' || worker.job_status === 'confirmed') return 'info'
    return 'default'
  }

  const getWorkerStatusText = (worker) => {
    if (!worker.latitude || !worker.longitude) return 'No location data'
    
    const lastUpdate = new Date(worker.timestamp)
    const now = new Date()
    const minutesSinceUpdate = Math.round((now - lastUpdate) / (1000 * 60))

    if (minutesSinceUpdate > 60) return `Offline (${Math.round(minutesSinceUpdate / 60)}h ago)`
    if (minutesSinceUpdate > 30) return `Last seen ${minutesSinceUpdate}m ago`
    if (worker.job_status === 'in_progress') return 'On visit'
    if (worker.job_status === 'assigned' || worker.job_status === 'confirmed') return 'En route'
    return 'Available'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'error'
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'emergency': return <EmergencyIcon color="error" />
      case 'late_arrival': return <ScheduleIcon color="warning" />
      case 'missed_call': return <WarningIcon color="error" />
      case 'medication_due': return <ScheduleIcon color="info" />
      default: return <WarningIcon />
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatLastUpdate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.round((now - date) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    return `${Math.round(diffMinutes / 60)}h ago`
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading monitoring data...</Typography>
        </Box>
      </Container>
    )
  }

  const activeWorkers = workerLocations.filter(w => w.latitude && w.longitude)
  const workersOnVisits = workerLocations.filter(w => w.job_status === 'in_progress')
  const criticalAlerts = activeAlerts.filter(a => a.priority === 'critical')

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Real-time Monitoring
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadMonitoringData}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Workers
                  </Typography>
                  <Typography variant="h4">
                    {activeWorkers.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    On Visits
                  </Typography>
                  <Typography variant="h4">
                    {workersOnVisits.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Alerts
                  </Typography>
                  <Typography variant="h4">
                    {activeAlerts.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmergencyIcon sx={{ mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Critical Alerts
                  </Typography>
                  <Typography variant="h4">
                    {criticalAlerts.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Worker Locations */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Worker Locations & Status
              </Typography>
              {workerLocations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <LocationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography color="textSecondary">
                    No worker location data available
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Worker</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Current Job</TableCell>
                        <TableCell>Last Update</TableCell>
                        <TableCell>Contact</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {workerLocations.map((worker) => (
                        <TableRow key={worker.worker_id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Badge
                                color={getWorkerStatusColor(worker)}
                                variant="dot"
                                sx={{ mr: 2 }}
                              >
                                <PersonIcon />
                              </Badge>
                              <Box>
                                <Typography variant="body2">
                                  {worker.first_name} {worker.last_name}
                                </Typography>
                                {worker.latitude && worker.longitude && (
                                  <Typography variant="caption" color="textSecondary">
                                    {worker.latitude.toFixed(4)}, {worker.longitude.toFixed(4)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getWorkerStatusText(worker)}
                              color={getWorkerStatusColor(worker)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {worker.current_job_id ? (
                              <Box>
                                <Typography variant="body2">
                                  {worker.client_first_name} {worker.client_last_name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {formatTime(worker.scheduled_start_time)} - {formatTime(worker.scheduled_end_time)}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography color="textSecondary">No active job</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {worker.timestamp ? formatLastUpdate(worker.timestamp) : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {worker.mobile && (
                                <Tooltip title={`Call ${worker.mobile}`}>
                                  <IconButton size="small" href={`tel:${worker.mobile}`}>
                                    <PhoneIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
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
        </Grid>

        {/* Active Alerts */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Alerts ({activeAlerts.length})
              </Typography>
              {activeAlerts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography color="textSecondary">
                    No active alerts
                  </Typography>
                </Box>
              ) : (
                <List>
                  {activeAlerts.map((alert, index) => (
                    <React.Fragment key={alert.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          {getAlertIcon(alert.alert_type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={alert.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {alert.message}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Chip 
                                  label={alert.priority} 
                                  color={getPriorityColor(alert.priority)}
                                  size="small"
                                />
                                <Typography variant="caption" color="textSecondary">
                                  {formatLastUpdate(alert.created_at)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < activeAlerts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default MonitoringPage

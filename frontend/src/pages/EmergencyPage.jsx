import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import {
  LocalHospital as EmergencyIcon,
  Warning as WarningIcon,
  Phone as PhoneIcon,
  LocalHospital as HospitalIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { apiService } from '../services/api'

const EmergencyPage = () => {
  const [activeAlerts, setActiveAlerts] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false)
  const [notifyFamilyDialogOpen, setNotifyFamilyDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)

  // Emergency protocol form state
  const [emergencyProtocol, setEmergencyProtocol] = useState({
    protocol_type: '',
    client_id: '',
    severity: 'high',
    description: '',
    location: '',
    emergency_services_required: false
  })

  // Family notification form state
  const [familyNotification, setFamilyNotification] = useState({
    client_id: '',
    notification_type: 'incident_update',
    message: '',
    urgent: false
  })

  useEffect(() => {
    loadData()
    // Refresh data every 30 seconds for emergency monitoring
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setError('')
      const [alertsResponse, clientsResponse] = await Promise.all([
        apiService.getAlerts({ status: 'active', limit: 50 }),
        apiService.getClients()
      ])

      if (alertsResponse.success) {
        setActiveAlerts(alertsResponse.data || [])
      }
      if (clientsResponse.success) {
        setClients(clientsResponse.data || [])
      }
    } catch (error) {
      console.error('Error loading emergency data:', error)
      setError('Failed to load emergency data')
    } finally {
      setLoading(false)
    }
  }

  const handleActivateProtocol = async () => {
    try {
      setError('')
      
      if (!emergencyProtocol.protocol_type || !emergencyProtocol.client_id || !emergencyProtocol.description) {
        setError('Please fill in all required fields')
        return
      }

      const response = await apiService.api.post('/emergency/activate-protocol', emergencyProtocol)
      if (response.data.success) {
        setProtocolDialogOpen(false)
        setEmergencyProtocol({
          protocol_type: '',
          client_id: '',
          severity: 'high',
          description: '',
          location: '',
          emergency_services_required: false
        })
        loadData() // Reload alerts
        alert('Emergency protocol activated successfully!')
      }
    } catch (error) {
      console.error('Error activating emergency protocol:', error)
      setError('Failed to activate emergency protocol')
    }
  }

  const handleNotifyFamily = async () => {
    try {
      setError('')
      
      if (!familyNotification.client_id || !familyNotification.message) {
        setError('Please fill in all required fields')
        return
      }

      const response = await apiService.api.post('/emergency/notify-family', familyNotification)
      if (response.data.success) {
        setNotifyFamilyDialogOpen(false)
        setFamilyNotification({
          client_id: '',
          notification_type: 'incident_update',
          message: '',
          urgent: false
        })
        alert('Family notification sent successfully!')
      }
    } catch (error) {
      console.error('Error sending family notification:', error)
      setError('Failed to send family notification')
    }
  }

  const handleCheckMissedCalls = async () => {
    try {
      setError('')
      const response = await apiService.api.post('/emergency/check-missed-calls')
      if (response.data.success) {
        loadData() // Reload alerts
        alert(`Missed call check completed. Found ${response.data.data.missed_jobs_found} missed jobs, created ${response.data.data.alerts_created} new alerts.`)
      }
    } catch (error) {
      console.error('Error checking missed calls:', error)
      setError('Failed to check missed calls')
    }
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
      case 'missed_call': return <ScheduleIcon color="warning" />
      case 'late_arrival': return <ScheduleIcon color="warning" />
      case 'medication_due': return <HospitalIcon color="info" />
      default: return <WarningIcon />
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading emergency data...</Typography>
        </Box>
      </Container>
    )
  }

  const criticalAlerts = activeAlerts.filter(a => a.priority === 'critical')
  const emergencyAlerts = activeAlerts.filter(a => a.alert_type === 'emergency')
  const missedCallAlerts = activeAlerts.filter(a => a.alert_type === 'missed_call')

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="error">
          Emergency Response Center
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<ScheduleIcon />}
            onClick={handleCheckMissedCalls}
            variant="outlined"
            color="warning"
            size="small"
          >
            Check Missed Calls
          </Button>
          <Button
            startIcon={<NotificationsIcon />}
            onClick={() => setNotifyFamilyDialogOpen(true)}
            variant="outlined"
            color="info"
            size="small"
          >
            Notify Family
          </Button>
          <Button
            startIcon={<EmergencyIcon />}
            onClick={() => setProtocolDialogOpen(true)}
            variant="contained"
            color="error"
            size="small"
          >
            Activate Emergency Protocol
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Emergency Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: criticalAlerts.length > 0 ? 'error.light' : 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmergencyIcon sx={{ mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Critical Alerts
                  </Typography>
                  <Typography variant="h4" color={criticalAlerts.length > 0 ? 'error.main' : 'text.primary'}>
                    {criticalAlerts.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: emergencyAlerts.length > 0 ? 'warning.light' : 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Emergencies
                  </Typography>
                  <Typography variant="h4" color={emergencyAlerts.length > 0 ? 'warning.main' : 'text.primary'}>
                    {emergencyAlerts.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: missedCallAlerts.length > 0 ? 'warning.light' : 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Missed Calls
                  </Typography>
                  <Typography variant="h4" color={missedCallAlerts.length > 0 ? 'warning.main' : 'text.primary'}>
                    {missedCallAlerts.length}
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
                <WarningIcon sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Active Alerts
                  </Typography>
                  <Typography variant="h4">
                    {activeAlerts.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Alerts List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Active Emergency Alerts
          </Typography>
          {activeAlerts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <EmergencyIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography color="success.main" variant="h6">
                No Active Emergency Alerts
              </Typography>
              <Typography color="textSecondary">
                All systems operating normally
              </Typography>
            </Box>
          ) : (
            <List>
              {activeAlerts
                .sort((a, b) => {
                  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                  return priorityOrder[a.priority] - priorityOrder[b.priority]
                })
                .map((alert) => (
                  <ListItem key={alert.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      {getAlertIcon(alert.alert_type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {alert.title}
                          </Typography>
                          <Chip 
                            label={alert.priority}
                            color={getPriorityColor(alert.priority)}
                            size="small"
                          />
                          {alert.alert_type === 'emergency' && (
                            <Chip label="EMERGENCY" color="error" size="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {alert.message}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatTime(alert.created_at)}
                            {alert.client_first_name && ` • Client: ${alert.client_first_name} ${alert.client_last_name}`}
                            {alert.user_first_name && ` • Worker: ${alert.user_first_name} ${alert.user_last_name}`}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {alert.client_id && (
                        <Tooltip title="Notify Family">
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => {
                              setSelectedClient(alert.client_id)
                              setFamilyNotification({ ...familyNotification, client_id: alert.client_id })
                              setNotifyFamilyDialogOpen(true)
                            }}
                          >
                            <NotificationsIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Emergency Call">
                        <IconButton size="small" color="error">
                          <PhoneIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Emergency Protocol Dialog */}
      <Dialog open={protocolDialogOpen} onClose={() => setProtocolDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle color="error">Activate Emergency Protocol</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            This will activate emergency response procedures. Only use for genuine emergencies.
          </Alert>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Protocol Type</InputLabel>
                <Select
                  value={emergencyProtocol.protocol_type}
                  onChange={(e) => setEmergencyProtocol({ ...emergencyProtocol, protocol_type: e.target.value })}
                  label="Protocol Type"
                >
                  <MenuItem value="medical_emergency">Medical Emergency</MenuItem>
                  <MenuItem value="safeguarding_concern">Safeguarding Concern</MenuItem>
                  <MenuItem value="fire">Fire Emergency</MenuItem>
                  <MenuItem value="security_breach">Security Breach</MenuItem>
                  <MenuItem value="natural_disaster">Natural Disaster</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={emergencyProtocol.client_id}
                  onChange={(e) => setEmergencyProtocol({ ...emergencyProtocol, client_id: e.target.value })}
                  label="Client"
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={emergencyProtocol.severity}
                  onChange={(e) => setEmergencyProtocol({ ...emergencyProtocol, severity: e.target.value })}
                  label="Severity"
                >
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={emergencyProtocol.location}
                onChange={(e) => setEmergencyProtocol({ ...emergencyProtocol, location: e.target.value })}
                placeholder="Specific location of emergency"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                required
                value={emergencyProtocol.description}
                onChange={(e) => setEmergencyProtocol({ ...emergencyProtocol, description: e.target.value })}
                placeholder="Detailed description of the emergency situation..."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={emergencyProtocol.emergency_services_required}
                    onChange={(e) => setEmergencyProtocol({ ...emergencyProtocol, emergency_services_required: e.target.checked })}
                  />
                }
                label="Emergency Services Required (999 call needed)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProtocolDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleActivateProtocol} variant="contained" color="error">
            Activate Emergency Protocol
          </Button>
        </DialogActions>
      </Dialog>

      {/* Family Notification Dialog */}
      <Dialog open={notifyFamilyDialogOpen} onClose={() => setNotifyFamilyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Notify Family Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={familyNotification.client_id}
                  onChange={(e) => setFamilyNotification({ ...familyNotification, client_id: e.target.value })}
                  label="Client"
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Notification Type</InputLabel>
                <Select
                  value={familyNotification.notification_type}
                  onChange={(e) => setFamilyNotification({ ...familyNotification, notification_type: e.target.value })}
                  label="Notification Type"
                >
                  <MenuItem value="incident_update">Incident Update</MenuItem>
                  <MenuItem value="health_concern">Health Concern</MenuItem>
                  <MenuItem value="service_update">Service Update</MenuItem>
                  <MenuItem value="emergency_notification">Emergency Notification</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={familyNotification.urgent}
                    onChange={(e) => setFamilyNotification({ ...familyNotification, urgent: e.target.checked })}
                  />
                }
                label="Urgent"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                required
                value={familyNotification.message}
                onChange={(e) => setFamilyNotification({ ...familyNotification, message: e.target.value })}
                placeholder="Message to send to family member..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotifyFamilyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleNotifyFamily} variant="contained">Send Notification</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default EmergencyPage

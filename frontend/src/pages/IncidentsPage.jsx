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
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import {
  Add as AddIcon,
  Warning as WarningIcon,
  LocalHospital as EmergencyIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import { apiService } from '../services/api'

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState(null)

  // New incident form state
  const [newIncident, setNewIncident] = useState({
    client_id: '',
    incident_type: '',
    severity: 'medium',
    incident_date: new Date().toISOString().split('T')[0],
    incident_time: new Date().toTimeString().slice(0, 5),
    location_of_incident: '',
    description: '',
    immediate_action_taken: '',
    injuries_sustained: '',
    witnesses: '',
    family_notified: false,
    gp_notified: false,
    emergency_services_called: false,
    emergency_services_details: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError('')
      const [incidentsResponse, clientsResponse] = await Promise.all([
        apiService.getIncidents({ limit: 100 }),
        apiService.getClients()
      ])

      if (incidentsResponse.success) {
        setIncidents(incidentsResponse.data || [])
      }
      if (clientsResponse.success) {
        setClients(clientsResponse.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load incidents data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIncident = async () => {
    try {
      setError('')
      
      // Validate required fields
      if (!newIncident.client_id || !newIncident.incident_type || !newIncident.description) {
        setError('Please fill in all required fields')
        return
      }

      const response = await apiService.api.post('/incidents', newIncident)
      if (response.data.success) {
        setCreateDialogOpen(false)
        setNewIncident({
          client_id: '',
          incident_type: '',
          severity: 'medium',
          incident_date: new Date().toISOString().split('T')[0],
          incident_time: new Date().toTimeString().slice(0, 5),
          location_of_incident: '',
          description: '',
          immediate_action_taken: '',
          injuries_sustained: '',
          witnesses: '',
          family_notified: false,
          gp_notified: false,
          emergency_services_called: false,
          emergency_services_details: ''
        })
        loadData() // Reload incidents
      }
    } catch (error) {
      console.error('Error creating incident:', error)
      setError('Failed to create incident report')
    }
  }

  const handleViewIncident = async (incident) => {
    try {
      const response = await apiService.api.get(`/incidents/${incident.id}`)
      if (response.data.success) {
        setSelectedIncident(response.data.data)
        setViewDialogOpen(true)
      }
    } catch (error) {
      console.error('Error loading incident details:', error)
      setError('Failed to load incident details')
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error'
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error'
      case 'investigating': return 'warning'
      case 'closed': return 'success'
      case 'referred': return 'info'
      default: return 'default'
    }
  }

  const getIncidentTypeIcon = (type) => {
    switch (type) {
      case 'fall': return <WarningIcon />
      case 'medication_error': return <AssignmentIcon />
      case 'injury': return <EmergencyIcon />
      case 'safeguarding': return <WarningIcon color="error" />
      default: return <WarningIcon />
    }
  }

  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading incidents...</Typography>
        </Box>
      </Container>
    )
  }

  const openIncidents = incidents.filter(i => i.status === 'open')
  const criticalIncidents = incidents.filter(i => i.severity === 'critical')
  const recentIncidents = incidents.filter(i => {
    const incidentDate = new Date(i.incident_date)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return incidentDate >= weekAgo
  })

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Incident Management
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          variant="contained"
          size="small"
        >
          Report Incident
        </Button>
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
                <WarningIcon sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Incidents
                  </Typography>
                  <Typography variant="h4">
                    {incidents.length}
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
                    Open Incidents
                  </Typography>
                  <Typography variant="h4">
                    {openIncidents.length}
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
                <WarningIcon sx={{ mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Critical
                  </Typography>
                  <Typography variant="h4">
                    {criticalIncidents.length}
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
                <AssignmentIcon sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    This Week
                  </Typography>
                  <Typography variant="h4">
                    {recentIncidents.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label={`All Incidents (${incidents.length})`} />
        <Tab label={`Open (${openIncidents.length})`} />
        <Tab label={`Critical (${criticalIncidents.length})`} />
      </Tabs>

      {/* Incidents Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {tabValue === 0 && 'All Incidents'}
            {tabValue === 1 && 'Open Incidents'}
            {tabValue === 2 && 'Critical Incidents'}
          </Typography>
          
          {(() => {
            let filteredIncidents = incidents
            if (tabValue === 1) filteredIncidents = openIncidents
            if (tabValue === 2) filteredIncidents = criticalIncidents

            return filteredIncidents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <WarningIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography color="textSecondary">
                  No incidents found
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Reference</TableCell>
                      <TableCell>Date/Time</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Reported By</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredIncidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {incident.incident_reference}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(incident.incident_date, incident.incident_time)}
                        </TableCell>
                        <TableCell>
                          {incident.client_first_name} {incident.client_last_name}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getIncidentTypeIcon(incident.incident_type)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {incident.incident_type.replace('_', ' ')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={incident.severity}
                            color={getSeverityColor(incident.severity)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={incident.status}
                            color={getStatusColor(incident.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {incident.reported_by_first_name} {incident.reported_by_last_name}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewIncident(incident)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          })()}
        </CardContent>
      </Card>

      {/* Create Incident Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Report New Incident</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={newIncident.client_id}
                  onChange={(e) => setNewIncident({ ...newIncident, client_id: e.target.value })}
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
              <FormControl fullWidth required>
                <InputLabel>Incident Type</InputLabel>
                <Select
                  value={newIncident.incident_type}
                  onChange={(e) => setNewIncident({ ...newIncident, incident_type: e.target.value })}
                  label="Incident Type"
                >
                  <MenuItem value="fall">Fall</MenuItem>
                  <MenuItem value="medication_error">Medication Error</MenuItem>
                  <MenuItem value="injury">Injury</MenuItem>
                  <MenuItem value="safeguarding">Safeguarding</MenuItem>
                  <MenuItem value="property_damage">Property Damage</MenuItem>
                  <MenuItem value="near_miss">Near Miss</MenuItem>
                  <MenuItem value="complaint">Complaint</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                  label="Severity"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newIncident.incident_date}
                onChange={(e) => setNewIncident({ ...newIncident, incident_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={newIncident.incident_time}
                onChange={(e) => setNewIncident({ ...newIncident, incident_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location of Incident"
                value={newIncident.location_of_incident}
                onChange={(e) => setNewIncident({ ...newIncident, location_of_incident: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                required
                value={newIncident.description}
                onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                placeholder="Provide a detailed description of what happened..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Immediate Action Taken"
                multiline
                rows={3}
                value={newIncident.immediate_action_taken}
                onChange={(e) => setNewIncident({ ...newIncident, immediate_action_taken: e.target.value })}
                placeholder="Describe what actions were taken immediately after the incident..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Injuries Sustained"
                multiline
                rows={2}
                value={newIncident.injuries_sustained}
                onChange={(e) => setNewIncident({ ...newIncident, injuries_sustained: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Witnesses"
                multiline
                rows={2}
                value={newIncident.witnesses}
                onChange={(e) => setNewIncident({ ...newIncident, witnesses: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newIncident.family_notified}
                    onChange={(e) => setNewIncident({ ...newIncident, family_notified: e.target.checked })}
                  />
                }
                label="Family Notified"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newIncident.gp_notified}
                    onChange={(e) => setNewIncident({ ...newIncident, gp_notified: e.target.checked })}
                  />
                }
                label="GP Notified"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newIncident.emergency_services_called}
                    onChange={(e) => setNewIncident({ ...newIncident, emergency_services_called: e.target.checked })}
                  />
                }
                label="Emergency Services Called"
              />
            </Grid>
            {newIncident.emergency_services_called && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Emergency Services Details"
                  multiline
                  rows={2}
                  value={newIncident.emergency_services_details}
                  onChange={(e) => setNewIncident({ ...newIncident, emergency_services_details: e.target.value })}
                  placeholder="Which services were called and what was the outcome..."
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateIncident} variant="contained">Report Incident</Button>
        </DialogActions>
      </Dialog>

      {/* View Incident Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Incident Details - {selectedIncident?.incident_reference}
        </DialogTitle>
        <DialogContent>
          {selectedIncident && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Client</Typography>
                <Typography variant="body1">
                  {selectedIncident.client_first_name} {selectedIncident.client_last_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Reported By</Typography>
                <Typography variant="body1">
                  {selectedIncident.reported_by_first_name} {selectedIncident.reported_by_last_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">Type</Typography>
                <Typography variant="body1">{selectedIncident.incident_type.replace('_', ' ')}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">Severity</Typography>
                <Chip 
                  label={selectedIncident.severity}
                  color={getSeverityColor(selectedIncident.severity)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip 
                  label={selectedIncident.status}
                  color={getStatusColor(selectedIncident.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedIncident.description}
                </Typography>
              </Grid>
              {selectedIncident.immediate_action_taken && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Immediate Action Taken</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedIncident.immediate_action_taken}
                  </Typography>
                </Grid>
              )}
              {selectedIncident.injuries_sustained && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Injuries Sustained</Typography>
                  <Typography variant="body1">{selectedIncident.injuries_sustained}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="contained">Edit Incident</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default IncidentsPage

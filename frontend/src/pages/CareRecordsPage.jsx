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
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  Add as AddIcon,
  Note as NoteIcon,
  Medication as MedicationIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { apiService } from '../services/api'

const CareRecordsPage = () => {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [careRecords, setCareRecords] = useState([])
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // New care record form state
  const [newRecord, setNewRecord] = useState({
    note_type: 'care_note',
    content: '',
    is_confidential: false
  })

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      loadClientData()
    }
  }, [selectedClient])

  const loadClients = async () => {
    try {
      setError('')
      const response = await apiService.getClients()
      if (response.success) {
        setClients(response.data || [])
      }
    } catch (error) {
      console.error('Error loading clients:', error)
      setError('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const loadClientData = async () => {
    if (!selectedClient) return

    try {
      setRecordsLoading(true)
      setError('')

      const [recordsResponse, medicationsResponse] = await Promise.all([
        apiService.api.get(`/care-records/client/${selectedClient.id}`),
        apiService.api.get(`/medications/client/${selectedClient.id}`)
      ])

      if (recordsResponse.data.success) {
        setCareRecords(recordsResponse.data.data || [])
      }
      if (medicationsResponse.data.success) {
        setMedications(medicationsResponse.data.data || [])
      }
    } catch (error) {
      console.error('Error loading client data:', error)
      setError('Failed to load client care data')
    } finally {
      setRecordsLoading(false)
    }
  }

  const handleCreateRecord = async () => {
    try {
      setError('')
      
      if (!newRecord.content.trim()) {
        setError('Please enter care note content')
        return
      }

      const response = await apiService.api.post('/care-records', {
        client_id: selectedClient.id,
        ...newRecord
      })

      if (response.data.success) {
        setCreateDialogOpen(false)
        setNewRecord({
          note_type: 'care_note',
          content: '',
          is_confidential: false
        })
        loadClientData() // Reload records
      }
    } catch (error) {
      console.error('Error creating care record:', error)
      setError('Failed to create care record')
    }
  }

  const getNoteTypeColor = (noteType) => {
    switch (noteType) {
      case 'care_note': return 'primary'
      case 'clinical_note': return 'error'
      case 'handover_note': return 'warning'
      case 'family_communication': return 'info'
      case 'internal_note': return 'default'
      default: return 'default'
    }
  }

  const getMedicationStatusColor = (medication) => {
    if (!medication.is_active) return 'default'
    
    const refusalRate = medication.total_administrations > 0 
      ? (medication.refused_administrations / medication.total_administrations) * 100 
      : 0

    if (refusalRate > 20) return 'error'
    if (refusalRate > 10) return 'warning'
    return 'success'
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
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
          <Typography sx={{ ml: 2 }}>Loading clients...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Care Records & Documentation
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Client Selection */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Client
              </Typography>
              <List>
                {clients.map((client) => (
                  <ListItem 
                    key={client.id}
                    button 
                    onClick={() => setSelectedClient(client)}
                    selected={selectedClient?.id === client.id}
                  >
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${client.first_name} ${client.last_name}`}
                      secondary={client.address_line1}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Client Care Data */}
        <Grid item xs={12} md={9}>
          {selectedClient ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    {selectedClient.first_name} {selectedClient.last_name} - Care Records
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    variant="contained"
                    size="small"
                  >
                    Add Care Note
                  </Button>
                </Box>

                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                  <Tab label={`Care Notes (${careRecords.length})`} />
                  <Tab label={`Medications (${medications.length})`} />
                  <Tab label="Task History" />
                </Tabs>

                {recordsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {/* Care Notes Tab */}
                    {tabValue === 0 && (
                      <Box>
                        {careRecords.length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <NoteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography color="textSecondary">
                              No care records found for this client
                            </Typography>
                          </Box>
                        ) : (
                          careRecords.map((record) => (
                            <Accordion key={record.id} sx={{ mb: 2 }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1">
                                      {formatDateTime(record.created_at)}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      By: {record.author_first_name} {record.author_last_name}
                                      {record.job_title && ` • ${record.job_title}`}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip 
                                      label={record.note_type.replace('_', ' ')}
                                      color={getNoteTypeColor(record.note_type)}
                                      size="small"
                                    />
                                    {record.is_confidential && (
                                      <Chip 
                                        label="Confidential"
                                        color="error"
                                        size="small"
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {record.content}
                                </Typography>
                                {record.photo_paths && JSON.parse(record.photo_paths).length > 0 && (
                                  <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Attachments: {JSON.parse(record.photo_paths).length} photo(s)
                                    </Typography>
                                  </Box>
                                )}
                              </AccordionDetails>
                            </Accordion>
                          ))
                        )}
                      </Box>
                    )}

                    {/* Medications Tab */}
                    {tabValue === 1 && (
                      <Box>
                        {medications.length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <MedicationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography color="textSecondary">
                              No medications recorded for this client
                            </Typography>
                          </Box>
                        ) : (
                          <TableContainer component={Paper} variant="outlined">
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Medication</TableCell>
                                  <TableCell>Dosage & Frequency</TableCell>
                                  <TableCell>Administration Stats</TableCell>
                                  <TableCell>Last Given</TableCell>
                                  <TableCell>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {medications.map((medication) => (
                                  <TableRow key={medication.id}>
                                    <TableCell>
                                      <Box>
                                        <Typography variant="body2" fontWeight="medium">
                                          {medication.medication_name}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                          {medication.route} • {medication.prescriber_name}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Box>
                                        <Typography variant="body2">
                                          {medication.dosage}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                          {medication.frequency}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Box>
                                        <Typography variant="body2">
                                          {medication.successful_administrations}/{medication.total_administrations} given
                                        </Typography>
                                        {medication.refused_administrations > 0 && (
                                          <Typography variant="caption" color="error">
                                            {medication.refused_administrations} refused
                                          </Typography>
                                        )}
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      {medication.last_administration_date 
                                        ? formatDate(medication.last_administration_date)
                                        : 'Never'
                                      }
                                    </TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={medication.is_active ? 'Active' : 'Inactive'}
                                        color={getMedicationStatusColor(medication)}
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

                    {/* Task History Tab */}
                    {tabValue === 2 && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography color="textSecondary">
                          Task history view coming soon
                        </Typography>
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
                  Select a client to view care records
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Create Care Record Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Care Note</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Note Type</InputLabel>
                <Select
                  value={newRecord.note_type}
                  onChange={(e) => setNewRecord({ ...newRecord, note_type: e.target.value })}
                  label="Note Type"
                >
                  <MenuItem value="care_note">Care Note</MenuItem>
                  <MenuItem value="clinical_note">Clinical Note</MenuItem>
                  <MenuItem value="handover_note">Handover Note</MenuItem>
                  <MenuItem value="family_communication">Family Communication</MenuItem>
                  <MenuItem value="internal_note">Internal Note</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Confidentiality</InputLabel>
                <Select
                  value={newRecord.is_confidential}
                  onChange={(e) => setNewRecord({ ...newRecord, is_confidential: e.target.value })}
                  label="Confidentiality"
                >
                  <MenuItem value={false}>Standard</MenuItem>
                  <MenuItem value={true}>Confidential</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Care Note Content"
                multiline
                rows={6}
                value={newRecord.content}
                onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
                placeholder="Enter detailed care notes, observations, and any relevant information..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRecord} variant="contained">Add Care Note</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default CareRecordsPage

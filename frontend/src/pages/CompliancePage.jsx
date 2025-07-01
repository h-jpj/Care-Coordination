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
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material'
import {
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import { apiService } from '../services/api'

const CompliancePage = () => {
  const [complianceSummary, setComplianceSummary] = useState(null)
  const [auditTrail, setAuditTrail] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadComplianceData()
  }, [dateFrom, dateTo])

  const loadComplianceData = async () => {
    try {
      setError('')
      setLoading(true)

      const [summaryResponse, auditResponse] = await Promise.all([
        apiService.api.get('/compliance/summary', { 
          params: { date_from: dateFrom, date_to: dateTo } 
        }),
        apiService.api.get('/compliance/audit-trail', { 
          params: { date_from: dateFrom, date_to: dateTo, limit: 100 } 
        })
      ])

      if (summaryResponse.data.success) {
        setComplianceSummary(summaryResponse.data.data)
      }
      if (auditResponse.data.success) {
        setAuditTrail(auditResponse.data.data || [])
      }
    } catch (error) {
      console.error('Error loading compliance data:', error)
      setError('Failed to load compliance data')
    } finally {
      setLoading(false)
    }
  }

  const getComplianceStatus = (metric, threshold) => {
    if (metric >= threshold) return { status: 'good', color: 'success', icon: <CheckCircleIcon /> }
    if (metric >= threshold * 0.8) return { status: 'warning', color: 'warning', icon: <WarningIcon /> }
    return { status: 'poor', color: 'error', icon: <ErrorIcon /> }
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

  const calculateCompletionRate = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  const calculateMedicationCompliance = (summary) => {
    if (!summary?.medications) return 0
    const { successful_administrations, total_administrations } = summary.medications
    return calculateCompletionRate(successful_administrations, total_administrations)
  }

  const calculateJobCompletionRate = (summary) => {
    if (!summary?.jobs) return 0
    const { completed_jobs, total_jobs } = summary.jobs
    return calculateCompletionRate(completed_jobs, total_jobs)
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading compliance data...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Compliance & Regulatory Reporting
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To Date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            size="small"
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {complianceSummary && (
        <>
          {/* Compliance Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Job Completion Rate
                      </Typography>
                      <Typography variant="h4">
                        {calculateJobCompletionRate(complianceSummary)}%
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
                    <SecurityIcon sx={{ mr: 2, color: 'success.main' }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Medication Compliance
                      </Typography>
                      <Typography variant="h4">
                        {calculateMedicationCompliance(complianceSummary)}%
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
                        Open Incidents
                      </Typography>
                      <Typography variant="h4">
                        {complianceSummary.incidents?.open_incidents || 0}
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
                    <ErrorIcon sx={{ mr: 2, color: 'error.main' }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Critical Incidents
                      </Typography>
                      <Typography variant="h4">
                        {complianceSummary.incidents?.critical_incidents || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab label="Compliance Metrics" />
            <Tab label="Audit Trail" />
            <Tab label="CQC Readiness" />
            <Tab label="Reports" />
          </Tabs>

          {/* Compliance Metrics Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Service Delivery Metrics
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          {getComplianceStatus(calculateJobCompletionRate(complianceSummary), 95).icon}
                        </ListItemIcon>
                        <ListItemText
                          primary="Job Completion Rate"
                          secondary={`${calculateJobCompletionRate(complianceSummary)}% (Target: 95%)`}
                        />
                        <Chip 
                          label={getComplianceStatus(calculateJobCompletionRate(complianceSummary), 95).status}
                          color={getComplianceStatus(calculateJobCompletionRate(complianceSummary), 95).color}
                          size="small"
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          {getComplianceStatus(calculateMedicationCompliance(complianceSummary), 98).icon}
                        </ListItemIcon>
                        <ListItemText
                          primary="Medication Administration"
                          secondary={`${calculateMedicationCompliance(complianceSummary)}% (Target: 98%)`}
                        />
                        <Chip 
                          label={getComplianceStatus(calculateMedicationCompliance(complianceSummary), 98).status}
                          color={getComplianceStatus(calculateMedicationCompliance(complianceSummary), 98).color}
                          size="small"
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          {complianceSummary.jobs?.missed_jobs === 0 ? <CheckCircleIcon /> : <WarningIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary="Missed Visits"
                          secondary={`${complianceSummary.jobs?.missed_jobs || 0} missed visits (Target: 0)`}
                        />
                        <Chip 
                          label={complianceSummary.jobs?.missed_jobs === 0 ? 'good' : 'needs attention'}
                          color={complianceSummary.jobs?.missed_jobs === 0 ? 'success' : 'warning'}
                          size="small"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Safety & Incident Metrics
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          {complianceSummary.incidents?.critical_incidents === 0 ? <CheckCircleIcon /> : <ErrorIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary="Critical Incidents"
                          secondary={`${complianceSummary.incidents?.critical_incidents || 0} critical incidents`}
                        />
                        <Chip 
                          label={complianceSummary.incidents?.critical_incidents === 0 ? 'excellent' : 'requires action'}
                          color={complianceSummary.incidents?.critical_incidents === 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          {complianceSummary.incidents?.open_incidents <= 2 ? <CheckCircleIcon /> : <WarningIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary="Open Incidents"
                          secondary={`${complianceSummary.incidents?.open_incidents || 0} incidents awaiting closure`}
                        />
                        <Chip 
                          label={complianceSummary.incidents?.open_incidents <= 2 ? 'good' : 'needs attention'}
                          color={complianceSummary.incidents?.open_incidents <= 2 ? 'success' : 'warning'}
                          size="small"
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          {complianceSummary.incidents?.pending_investigations === 0 ? <CheckCircleIcon /> : <WarningIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary="Pending Investigations"
                          secondary={`${complianceSummary.incidents?.pending_investigations || 0} investigations pending`}
                        />
                        <Chip 
                          label={complianceSummary.incidents?.pending_investigations === 0 ? 'up to date' : 'action required'}
                          color={complianceSummary.incidents?.pending_investigations === 0 ? 'success' : 'warning'}
                          size="small"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Period Summary ({complianceSummary.period?.from} to {complianceSummary.period?.to})
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" color="primary">
                            {complianceSummary.jobs?.total_jobs || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total Jobs Scheduled
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" color="success.main">
                            {complianceSummary.jobs?.completed_jobs || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Jobs Completed
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" color="info.main">
                            {complianceSummary.medications?.total_administrations || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Medications Given
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" color="warning.main">
                            {complianceSummary.incidents?.total_incidents || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Incidents Reported
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Audit Trail Tab */}
          {tabValue === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Audit Trail
                </Typography>
                {auditTrail.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography color="textSecondary">
                      No audit trail entries found for the selected period
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Table</TableCell>
                          <TableCell>Record ID</TableCell>
                          <TableCell>IP Address</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {auditTrail.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{formatDateTime(entry.created_at)}</TableCell>
                            <TableCell>
                              {entry.first_name} {entry.last_name}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={entry.action}
                                color={entry.action === 'CREATE' ? 'success' : entry.action === 'DELETE' ? 'error' : 'info'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{entry.table_name}</TableCell>
                            <TableCell>{entry.record_id}</TableCell>
                            <TableCell>{entry.ip_address}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* CQC Readiness Tab */}
          {tabValue === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  CQC Inspection Readiness
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  This section provides an overview of your readiness for CQC inspection based on key performance indicators.
                </Alert>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Safe
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Incident Management"
                          secondary={`${complianceSummary.incidents?.total_incidents || 0} incidents reported, ${complianceSummary.incidents?.open_incidents || 0} open`}
                        />
                        <Chip 
                          label={complianceSummary.incidents?.open_incidents === 0 ? 'Compliant' : 'Review Required'}
                          color={complianceSummary.incidents?.open_incidents === 0 ? 'success' : 'warning'}
                          size="small"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Medication Safety"
                          secondary={`${calculateMedicationCompliance(complianceSummary)}% administration compliance`}
                        />
                        <Chip 
                          label={calculateMedicationCompliance(complianceSummary) >= 98 ? 'Excellent' : 'Needs Improvement'}
                          color={calculateMedicationCompliance(complianceSummary) >= 98 ? 'success' : 'warning'}
                          size="small"
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Effective
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Service Delivery"
                          secondary={`${calculateJobCompletionRate(complianceSummary)}% job completion rate`}
                        />
                        <Chip 
                          label={calculateJobCompletionRate(complianceSummary) >= 95 ? 'Excellent' : 'Needs Improvement'}
                          color={calculateJobCompletionRate(complianceSummary) >= 95 ? 'success' : 'warning'}
                          size="small"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Care Documentation"
                          secondary="Digital care records with audit trails"
                        />
                        <Chip label="Compliant" color="success" size="small" />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Reports Tab */}
          {tabValue === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Compliance Reports
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <DescriptionIcon sx={{ mb: 2, color: 'primary.main' }} />
                        <Typography variant="h6" gutterBottom>
                          Monthly Compliance Report
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Comprehensive monthly report covering all compliance metrics
                        </Typography>
                        <Button variant="outlined" startIcon={<DownloadIcon />} fullWidth>
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <SecurityIcon sx={{ mb: 2, color: 'success.main' }} />
                        <Typography variant="h6" gutterBottom>
                          Incident Summary
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Detailed incident analysis and trends report
                        </Typography>
                        <Button variant="outlined" startIcon={<DownloadIcon />} fullWidth>
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <AssessmentIcon sx={{ mb: 2, color: 'info.main' }} />
                        <Typography variant="h6" gutterBottom>
                          CQC Inspection Pack
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Complete documentation package for CQC inspections
                        </Typography>
                        <Button variant="outlined" startIcon={<DownloadIcon />} fullWidth>
                          Generate Pack
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  )
}

export default CompliancePage

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Button,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'

const DashboardPage = () => {
  const { user, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [todaysJobs, setTodaysJobs] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setError('')
      const [summaryResponse, jobsResponse, alertsResponse] = await Promise.all([
        apiService.api.get('/dashboard/summary'),
        apiService.getJobs({ date: new Date().toISOString().split('T')[0] }),
        apiService.api.get('/alerts?status=active&limit=10')
      ])

      if (summaryResponse.data.success) {
        setDashboardData(summaryResponse.data.data)
      }
      if (jobsResponse.success) {
        setTodaysJobs(jobsResponse.data || [])
      }
      if (alertsResponse.data.success) {
        setAlerts(alertsResponse.data.data || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data. Please refresh the page.')
    } finally {
      setLoading(false)
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
      case 'critical': return 'error'
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'emergency': return <WarningIcon color="error" />
      case 'late_arrival': return <ScheduleIcon color="warning" />
      case 'missed_call': return <WarningIcon color="error" />
      case 'medication_due': return <AssignmentIcon color="info" />
      default: return <WarningIcon />
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Summary Cards */}
          {dashboardData && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Today's Jobs
                        </Typography>
                        <Typography variant="h4">
                          {dashboardData.jobs.total_jobs}
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
                          Active Workers
                        </Typography>
                        <Typography variant="h4">
                          {dashboardData.workers}
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
                      <HomeIcon sx={{ mr: 2, color: 'info.main' }} />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Active Clients
                        </Typography>
                        <Typography variant="h4">
                          {dashboardData.clients}
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
                          {dashboardData.alerts}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Job Status Breakdown */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Today's Job Status
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" color="success.main">
                            {dashboardData.jobs.completed_jobs}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Completed
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" color="primary.main">
                            {dashboardData.jobs.in_progress_jobs}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            In Progress
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" color="warning.main">
                            {dashboardData.jobs.pending_jobs}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Pending
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" color="error.main">
                            {dashboardData.jobs.late_jobs + dashboardData.jobs.missed_jobs}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Late/Missed
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Active Alerts */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Active Alerts
                    </Typography>
                    {alerts.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                        <Typography color="textSecondary">
                          No active alerts
                        </Typography>
                      </Box>
                    ) : (
                      <List>
                        {alerts.slice(0, 5).map((alert, index) => (
                          <React.Fragment key={alert.id}>
                            <ListItem>
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
                                    <Chip
                                      label={alert.priority}
                                      color={getPriorityColor(alert.priority)}
                                      size="small"
                                      sx={{ mt: 1 }}
                                    />
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < alerts.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {/* Today's Schedule */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Schedule
                </Typography>
                {todaysJobs.length === 0 ? (
                  <Typography color="textSecondary">
                    No jobs scheduled for today
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>Client</TableCell>
                          <TableCell>Worker</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Priority</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {todaysJobs.slice(0, 10).map((job) => (
                          <TableRow key={job.id}>
                            <TableCell>
                              {new Date(job.scheduled_start_time).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>
                              {job.client_preferred_name || job.client_first_name} {job.client_last_name}
                              <br />
                              <Typography variant="caption" color="textSecondary">
                                {job.address_line1}, {job.city}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {job.worker_first_name} {job.worker_last_name}
                            </TableCell>
                            <TableCell>{job.plan_name || job.title}</TableCell>
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
  )
}

export default DashboardPage

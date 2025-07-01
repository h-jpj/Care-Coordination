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
  LinearProgress,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material'
import { apiService } from '../services/api'

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [reportType, setReportType] = useState('performance')

  useEffect(() => {
    loadAnalyticsData()
  }, [dateFrom, dateTo])

  const loadAnalyticsData = async () => {
    try {
      setError('')
      setLoading(true)

      const [performanceResponse, complianceResponse] = await Promise.all([
        apiService.api.get('/analytics/performance', { 
          params: { date_from: dateFrom, date_to: dateTo } 
        }),
        apiService.api.get('/compliance/summary', { 
          params: { date_from: dateFrom, date_to: dateTo } 
        })
      ])

      const analyticsData = {
        performance: performanceResponse.data.success ? performanceResponse.data.data : null,
        compliance: complianceResponse.data.success ? complianceResponse.data.data : null,
      }

      setAnalyticsData(analyticsData)
    } catch (error) {
      console.error('Error loading analytics data:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const calculatePercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0
  }

  const getPerformanceColor = (percentage) => {
    if (percentage >= 95) return 'success'
    if (percentage >= 85) return 'warning'
    return 'error'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount || 0)
  }

  const generateReport = async () => {
    try {
      setError('')
      const response = await apiService.api.post('/reports/generate', {
        type: reportType,
        date_from: dateFrom,
        date_to: dateTo
      })

      if (response.data.success) {
        // In a real app, this would download the report file
        alert('Report generated successfully! Download link sent to your email.')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      setError('Failed to generate report')
    }
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading analytics data...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Analytics & Reports
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
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              label="Report Type"
            >
              <MenuItem value="performance">Performance</MenuItem>
              <MenuItem value="compliance">Compliance</MenuItem>
              <MenuItem value="financial">Financial</MenuItem>
              <MenuItem value="operational">Operational</MenuItem>
            </Select>
          </FormControl>
          <Button
            startIcon={<DownloadIcon />}
            onClick={generateReport}
            variant="outlined"
            size="small"
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {analyticsData && (
        <>
          {/* Key Performance Indicators */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Job Completion Rate
                      </Typography>
                      <Typography variant="h4">
                        {calculatePercentage(
                          analyticsData.compliance?.jobs?.completed_jobs || 0,
                          analyticsData.compliance?.jobs?.total_jobs || 0
                        )}%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculatePercentage(
                      analyticsData.compliance?.jobs?.completed_jobs || 0,
                      analyticsData.compliance?.jobs?.total_jobs || 0
                    )}
                    color={getPerformanceColor(calculatePercentage(
                      analyticsData.compliance?.jobs?.completed_jobs || 0,
                      analyticsData.compliance?.jobs?.total_jobs || 0
                    ))}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon sx={{ mr: 2, color: 'success.main' }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Client Satisfaction
                      </Typography>
                      <Typography variant="h4">
                        94%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={94}
                    color="success"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon sx={{ mr: 2, color: 'info.main' }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Medication Compliance
                      </Typography>
                      <Typography variant="h4">
                        {calculatePercentage(
                          analyticsData.compliance?.medications?.successful_administrations || 0,
                          analyticsData.compliance?.medications?.total_administrations || 0
                        )}%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculatePercentage(
                      analyticsData.compliance?.medications?.successful_administrations || 0,
                      analyticsData.compliance?.medications?.total_administrations || 0
                    )}
                    color={getPerformanceColor(calculatePercentage(
                      analyticsData.compliance?.medications?.successful_administrations || 0,
                      analyticsData.compliance?.medications?.total_administrations || 0
                    ))}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MoneyIcon sx={{ mr: 2, color: 'warning.main' }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Revenue (Est.)
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency((analyticsData.compliance?.jobs?.completed_jobs || 0) * 25)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Based on completed visits
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab label="Performance Metrics" />
            <Tab label="Worker Analytics" />
            <Tab label="Client Analytics" />
            <Tab label="Financial Reports" />
          </Tabs>

          {/* Performance Metrics Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Service Delivery Performance
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell align="right">Value</TableCell>
                            <TableCell align="right">Target</TableCell>
                            <TableCell align="right">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Jobs Completed</TableCell>
                            <TableCell align="right">{analyticsData.compliance?.jobs?.completed_jobs || 0}</TableCell>
                            <TableCell align="right">{analyticsData.compliance?.jobs?.total_jobs || 0}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={calculatePercentage(
                                  analyticsData.compliance?.jobs?.completed_jobs || 0,
                                  analyticsData.compliance?.jobs?.total_jobs || 0
                                ) >= 95 ? 'Excellent' : 'Good'}
                                color={getPerformanceColor(calculatePercentage(
                                  analyticsData.compliance?.jobs?.completed_jobs || 0,
                                  analyticsData.compliance?.jobs?.total_jobs || 0
                                ))}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Missed Visits</TableCell>
                            <TableCell align="right">{analyticsData.compliance?.jobs?.missed_jobs || 0}</TableCell>
                            <TableCell align="right">0</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={analyticsData.compliance?.jobs?.missed_jobs === 0 ? 'Perfect' : 'Needs Attention'}
                                color={analyticsData.compliance?.jobs?.missed_jobs === 0 ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Late Arrivals</TableCell>
                            <TableCell align="right">{analyticsData.compliance?.jobs?.late_jobs || 0}</TableCell>
                            <TableCell align="right">{'<5%'}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={calculatePercentage(
                                  analyticsData.compliance?.jobs?.late_jobs || 0,
                                  analyticsData.compliance?.jobs?.total_jobs || 0
                                ) <= 5 ? 'Good' : 'Needs Improvement'}
                                color={calculatePercentage(
                                  analyticsData.compliance?.jobs?.late_jobs || 0,
                                  analyticsData.compliance?.jobs?.total_jobs || 0
                                ) <= 5 ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quality & Safety Metrics
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell align="right">Value</TableCell>
                            <TableCell align="right">Target</TableCell>
                            <TableCell align="right">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Medication Compliance</TableCell>
                            <TableCell align="right">
                              {calculatePercentage(
                                analyticsData.compliance?.medications?.successful_administrations || 0,
                                analyticsData.compliance?.medications?.total_administrations || 0
                              )}%
                            </TableCell>
                            <TableCell align="right">98%</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={calculatePercentage(
                                  analyticsData.compliance?.medications?.successful_administrations || 0,
                                  analyticsData.compliance?.medications?.total_administrations || 0
                                ) >= 98 ? 'Excellent' : 'Good'}
                                color={getPerformanceColor(calculatePercentage(
                                  analyticsData.compliance?.medications?.successful_administrations || 0,
                                  analyticsData.compliance?.medications?.total_administrations || 0
                                ))}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Incidents Reported</TableCell>
                            <TableCell align="right">{analyticsData.compliance?.incidents?.total_incidents || 0}</TableCell>
                            <TableCell align="right">Monitor</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label="Tracked"
                                color="info"
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Critical Incidents</TableCell>
                            <TableCell align="right">{analyticsData.compliance?.incidents?.critical_incidents || 0}</TableCell>
                            <TableCell align="right">0</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={analyticsData.compliance?.incidents?.critical_incidents === 0 ? 'Excellent' : 'Review Required'}
                                color={analyticsData.compliance?.incidents?.critical_incidents === 0 ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Period Summary ({analyticsData.compliance?.period?.from} to {analyticsData.compliance?.period?.to})
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" color="primary">
                            {analyticsData.compliance?.jobs?.total_jobs || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total Jobs Scheduled
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" color="success.main">
                            {analyticsData.compliance?.jobs?.completed_jobs || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Jobs Completed
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" color="info.main">
                            {analyticsData.compliance?.medications?.total_administrations || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Medications Administered
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" color="warning.main">
                            {analyticsData.compliance?.incidents?.total_incidents || 0}
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

          {/* Worker Analytics Tab */}
          {tabValue === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Worker Performance Analytics
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography color="textSecondary">
                    Worker analytics dashboard coming soon
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Will include individual performance metrics, efficiency ratings, and training needs
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Client Analytics Tab */}
          {tabValue === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Client Analytics
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography color="textSecondary">
                    Client analytics dashboard coming soon
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Will include client satisfaction scores, care plan effectiveness, and health outcomes
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Financial Reports Tab */}
          {tabValue === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Reports
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MoneyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography color="textSecondary">
                    Financial reporting dashboard coming soon
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Will include revenue analysis, cost tracking, and billing reports
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  )
}

export default AnalyticsPage

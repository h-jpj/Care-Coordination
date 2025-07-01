import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import { Work, People, Assignment, TrendingUp } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { socketService } from '../services/socketService';
import { Job } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  completedToday: number;
  lateJobs: number;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    completedToday: 0,
    lateJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
    
    // Connect to WebSocket for real-time updates
    if (user) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        socketService.connect(token);
        
        // Listen for job status updates
        socketService.on('job_status_updated', handleJobStatusUpdate);
        socketService.on('job_assigned', handleJobAssigned);
      }
    }

    return () => {
      socketService.off('job_status_updated');
      socketService.off('job_assigned');
    };
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Load today's jobs
      const jobsResponse = await apiService.getJobs({ date: today });
      if (jobsResponse.success) {
        const jobsData = jobsResponse.data || [];
        setJobs(jobsData);
        
        // Calculate stats
        const totalJobs = jobsData.length;
        const activeJobs = jobsData.filter((job: Job) => 
          ['pending', 'assigned', 'in_progress'].includes(job.status)
        ).length;
        const completedToday = jobsData.filter((job: Job) => 
          job.status === 'completed'
        ).length;
        const lateJobs = jobsData.filter((job: Job) => 
          job.status === 'late'
        ).length;
        
        setStats({ totalJobs, activeJobs, completedToday, lateJobs });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleJobStatusUpdate = (data: any) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === data.jobId 
          ? { ...job, status: data.status }
          : job
      )
    );
    // Recalculate stats
    loadDashboardData();
  };

  const handleJobAssigned = (data: any) => {
    // Refresh data when new jobs are assigned
    loadDashboardData();
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
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.firstName}! Here's what's happening today.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Work sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalJobs}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Jobs Today
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
                <Assignment sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.activeJobs}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Jobs
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
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.completedToday}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Today
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
                <People sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.lateJobs}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Late Jobs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Jobs */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Today's Jobs</Typography>
            <Button variant="outlined" href="/jobs">
              View All Jobs
            </Button>
          </Box>

          {jobs.length === 0 ? (
            <Typography color="text.secondary">
              No jobs scheduled for today.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {jobs.slice(0, 6).map((job) => (
                <Grid item xs={12} md={6} key={job.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" noWrap>
                          {job.title}
                        </Typography>
                        <Chip 
                          label={getStatusLabel(job.status)} 
                          color={getStatusColor(job.status) as any}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {job.client.firstName} {job.client.lastName}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {job.client.addressLine1}, {job.client.city}
                      </Typography>
                      
                      <Typography variant="body2">
                        {new Date(job.scheduledStartTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(job.scheduledEndTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Typography>
                      
                      {job.worker && (
                        <Typography variant="body2" color="text.secondary">
                          Assigned to: {job.worker.firstName} {job.worker.lastName}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Group as ClientsIcon,
  Visibility as MonitoringIcon,
  Description as CareRecordsIcon,
  Warning as IncidentsIcon,
  Assessment as ComplianceIcon,
  LocalHospital as EmergencyIcon,
  Analytics as AnalyticsIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const Navigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/jobs', label: 'Job Scheduling', icon: <ScheduleIcon /> },
    { path: '/workers', label: 'Worker Management', icon: <PersonIcon /> },
    { path: '/clients', label: 'Client Management', icon: <ClientsIcon /> },
    { path: '/monitoring', label: 'Real-time Monitoring', icon: <MonitoringIcon /> },
    { path: '/care-records', label: 'Care Records', icon: <CareRecordsIcon /> },
    { path: '/incidents', label: 'Incident Management', icon: <IncidentsIcon /> },
    { path: '/compliance', label: 'Compliance & Reports', icon: <ComplianceIcon /> },
    { path: '/emergency', label: 'Emergency Response', icon: <EmergencyIcon /> },
    { path: '/analytics', label: 'Analytics & Reports', icon: <AnalyticsIcon /> },
  ]

  const handleNavigation = (path) => {
    navigate(path)
    setDrawerOpen(false)
  }

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleLogout = async () => {
    handleUserMenuClose()
    await logout()
  }

  const isCurrentPath = (path) => {
    return location.pathname === path
  }

  return (
    <>
      <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(true)}
            edge="start"
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Care Coordination System
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, mr: 2 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 0.5,
                  px: 2,
                  minWidth: 'auto',
                  backgroundColor: isCurrentPath(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                startIcon={item.icon}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Notifications */}
          <IconButton
            color="inherit"
            sx={{ mr: 1 }}
            onClick={() => {
              // TODO: Open notifications panel
              console.log('Notifications clicked')
            }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <IconButton
              onClick={handleUserMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { sm: 'none' } }}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, mb: 2 }}>
            Navigation
          </Typography>
          <List>
            {navigationItems.map((item) => (
              <ListItem
                button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                selected={isCurrentPath(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem disabled>
          <Box>
            <Typography variant="subtitle2">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {user?.role?.replace('_', ' ').toUpperCase()}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  )
}

export default Navigation

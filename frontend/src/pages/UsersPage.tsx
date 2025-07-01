import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Search, Edit, Delete, Phone, Email } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { User } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User & { password: string }>>({
    role: 'ground_worker',
  });

  useEffect(() => {
    if (currentUser?.role === 'office_worker') {
      loadUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    // Filter users based on search term and role
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName || !newUser.role) {
        setError('Please fill in all required fields');
        return;
      }

      const response = await apiService.createUser(newUser);
      if (response.success) {
        setCreateDialogOpen(false);
        setNewUser({ role: 'ground_worker' });
        loadUsers();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) return;

      const { password, ...updateData } = selectedUser as any;
      const response = await apiService.updateUser(selectedUser.id, updateData);
      if (response.success) {
        setEditDialogOpen(false);
        setSelectedUser(null);
        loadUsers();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      if (window.confirm('Are you sure you want to deactivate this user?')) {
        const response = await apiService.deleteUser(userId);
        if (response.success) {
          loadUsers();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate user');
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser({ ...user });
    setEditDialogOpen(true);
  };

  // Only office workers can access this page
  if (currentUser?.role !== 'office_worker') {
    return (
      <Box>
        <Alert severity="error">Access denied. Only office workers can manage users.</Alert>
      </Box>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Users</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={8}>
              <TextField
                fullWidth
                label="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="office_worker">Office Workers</MenuItem>
                  <MenuItem value="ground_worker">Ground Workers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" textAlign="center">
              {searchTerm || roleFilter ? 'No users found matching your filters.' : 'No users found.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} md={6} lg={4} key={user.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Box>
                      <Chip 
                        label={user.role === 'office_worker' ? 'Office Worker' : 'Ground Worker'} 
                        color={user.role === 'office_worker' ? 'primary' : 'secondary'}
                        size="small"
                      />
                      <Chip 
                        label={user.isActive ? 'Active' : 'Inactive'} 
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                      <Box sx={{ mt: 1 }}>
                        <IconButton size="small" onClick={() => openEditDialog(user)}>
                          <Edit />
                        </IconButton>
                        {user.id !== currentUser?.id && (
                          <IconButton size="small" onClick={() => handleDeleteUser(user.id)}>
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  
                  {user.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {user.phone}
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newUser.firstName || ''}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newUser.lastName || ''}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUser.email || ''}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newUser.password || ''}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={newUser.phone || ''}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role || 'ground_worker'}
                  label="Role"
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                >
                  <MenuItem value="ground_worker">Ground Worker</MenuItem>
                  <MenuItem value="office_worker">Office Worker</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">Add User</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={selectedUser.firstName || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={selectedUser.lastName || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={selectedUser.email || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  required
                  disabled
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedUser.role || 'ground_worker'}
                    label="Role"
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as any })}
                    disabled={selectedUser.id === currentUser?.id}
                  >
                    <MenuItem value="ground_worker">Ground Worker</MenuItem>
                    <MenuItem value="office_worker">Office Worker</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedUser.isActive ? 'active' : 'inactive'}
                    label="Status"
                    onChange={(e) => setSelectedUser({ ...selectedUser, isActive: e.target.value === 'active' })}
                    disabled={selectedUser.id === currentUser?.id}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">Update User</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

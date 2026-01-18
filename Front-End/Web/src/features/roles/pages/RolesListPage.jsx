import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
  Grid,
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AdminPanelSettings as RoleIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../../contexts/UIContext';
import { useAuth } from '../../../contexts/AuthContext';
import roleService from '../../../services/roleService';
import { formatPermissionLabel } from '../../../utils/permissions';
import RoleDeleteDialog from '../components/RoleDeleteDialog';
import RoleDetailsDialog from '../components/RoleDetailsDialog';
import RoleFormDialog from '../components/RoleFormDialog';

const RolesListPage = () => {
  const { showError, showSuccess } = useUI();
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    fetchRoles();
  }, [statusFilter]);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const filters = statusFilter !== 'all' ? { isActive: statusFilter === 'active' } : {};
      const response = await roleService.getRoles(filters);
      const rolesData = response.data?.roles || response.roles || response.data || [];
      setRoles(rolesData);
    } catch (error) {
      showError('Failed to load roles');
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpandRow = (roleId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleCardClick = (role) => {
    setSelectedRole(role);
    setDetailsDialogOpen(true);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setFormDialogOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setFormDialogOpen(true);
  };

  const handleDeleteRole = (role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;
    
    try {
      await roleService.deleteRole(selectedRole.id);
      showSuccess('Role deleted successfully');
      setDeleteDialogOpen(false);
      fetchRoles();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete role';
      showError(message);
    }
  };

  const isSystemRole = (roleName) => {
    return roleName === 'Super Admin';
  };

  // Role card component for grid view
  const RoleCard = ({ role }) => (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
          transform: 'translateY(-2px)',
        },
      }}
      onClick={() => handleCardClick(role)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: role.isActive ? 'primary.main' : 'grey.400',
              width: 48,
              height: 48,
            }}
          >
            <RoleIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {role.roleName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {role.description || 'No description'}
            </Typography>
          </Box>
          <Chip
            label={role.isActive ? 'Active' : 'Inactive'}
            color={role.isActive ? 'success' : 'default'}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Permissions
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {role.permissions?.includes('*')
                ? 'Full Access'
                : ` permissions`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
            <IconButton
              size="small"
              onClick={() => handleEditRole(role)}
              sx={{
                '&:hover': {
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteRole(role)}
              disabled={isSystemRole(role.roleName)}
              sx={{
                '&:hover': {
                  bgcolor: 'error.lighter',
                  color: 'error.main',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Role Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              <GridViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          {hasPermission('roles.create') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateRole}
              sx={{ textTransform: 'none' }}
            >
              New Role
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Content - Table or Grid */}
      {viewMode === 'list' ? (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="50"></TableCell>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <React.Fragment key={role.id}>
                    <TableRow
                      hover
                      onClick={() => handleCardClick(role)}
                      sx={{
                        cursor: 'pointer',
                        '& > *': { borderBottom: 'unset' },
                      }}
                    >
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpandRow(role.id);
                          }}
                        >
                          {expandedRows[role.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: role.isActive ? 'primary.main' : 'grey.400',
                            }}
                          >
                            <RoleIcon fontSize="small" />
                          </Avatar>
                          <Typography fontWeight={600}>{role.roleName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {role.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={` permissions`}
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpandRow(role.id);
                          }}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={role.isActive ? 'Active' : 'Inactive'}
                          color={role.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        {hasPermission('roles.update') && (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditRole(role)}
                              sx={{
                                '&:hover': {
                                  bgcolor: 'primary.lighter',
                                  color: 'primary.main',
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {hasPermission('roles.delete') && (
                          <Tooltip title={isSystemRole(role.roleName) ? 'System role cannot be deleted' : 'Delete'}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteRole(role)}
                                disabled={isSystemRole(role.roleName)}
                                sx={{
                                  ml: 1,
                                  '&:hover': {
                                    bgcolor: 'error.lighter',
                                    color: 'error.main',
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={expandedRows[role.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, px: 2, bgcolor: 'background.default' }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                              Permissions
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {role.permissions?.includes('*') ? (
                                <Chip
                                  label="Full Access (All Permissions)"
                                  color="warning"
                                  size="small"
                                />
                              ) : (
                                role.permissions?.map((permission, index) => (
                                  <Chip
                                    key={index}
                                    label={formatPermissionLabel(permission)}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))
                              )}
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {roles.map((role) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={role.id}>
              <RoleCard role={role} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialogs */}
      <RoleDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        role={selectedRole}
        onConfirm={handleDeleteConfirm}
      />

      <RoleDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        role={selectedRole}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
      />

      <RoleFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        role={selectedRole}
        onSuccess={fetchRoles}
      />
    </Box>
  );
};

export default RolesListPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  AdminPanelSettings as RolesIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

const DashboardPage = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Users',
      value: '156',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#6366f1',
      bgColor: '#e0e7ff',
      change: '+12%',
    },
    {
      title: 'Categories',
      value: '24',
      icon: <CategoryIcon sx={{ fontSize: 40 }} />,
      color: '#10b981',
      bgColor: '#d1fae5',
      change: '+5%',
    },
    {
      title: 'Products',
      value: '1,284',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      change: '+18%',
    },
    {
      title: 'Stock Value',
      value: '$45.2K',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#ef4444',
      bgColor: '#fee2e2',
      change: '+8%',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or remove users',
      icon: <PeopleIcon />,
      path: '/users',
      permission: 'user:read',
    },
    {
      title: 'Manage Roles',
      description: 'Configure user roles and permissions',
      icon: <RolesIcon />,
      path: '/roles',
      permission: 'role:read',
    },
    {
      title: 'Manage Categories',
      description: 'Organize product categories',
      icon: <CategoryIcon />,
      path: '/categories',
      permission: 'category:read',
    },
    {
      title: 'Manage Products',
      description: 'View and update product inventory',
      icon: <InventoryIcon />,
      path: '/products',
      permission: 'product:read',
    },
  ];

  const availableActions = quickActions.filter(
    (action) => !action.permission || hasPermission(action.permission)
  );

  return (
    <Box>
      {/* Welcome Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user?.name || 'User'}! 👋
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Here's what's happening with your warehouse today.
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: stat.color, fontWeight: 600 }}>
                      {stat.change} from last month
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: stat.bgColor,
                      color: stat.color,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions / Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <List sx={{ mt: 1 }}>
                {availableActions.map((action, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => navigate(action.path)}
                      sx={{
                        borderRadius: 1.5,
                        '&:hover': {
                          backgroundColor: 'primary.lighter',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'primary.main' }}>
                        {action.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={action.title}
                        secondary={action.description}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: '0.95rem',
                        }}
                      />
                      <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    New product added
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    2 minutes ago
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    User role updated
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    15 minutes ago
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Category created
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    1 hour ago
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Stock updated
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    3 hours ago
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  TablePagination,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useUI } from '../../../contexts/UIContext';
import { useAuth } from '../../../contexts/AuthContext';
import pmsService from '../../../services/pmsService';
import CategoryFormDialog from '../components/CategoryFormDialog';
import CategoryDeleteDialog from '../components/CategoryDeleteDialog';
import CategoryDetailsDialog from '../components/CategoryDetailsDialog';

const CategoriesListPage = () => {
  const { showError, showSuccess } = useUI();
  const { hasPermission } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  useEffect(() => {
    fetchCategories();
  }, [statusFilter, searchTerm, page, rowsPerPage]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: page + 1, // Backend uses 1-based pagination
        limit: rowsPerPage,
      };
      
      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active';
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await pmsService.getCategories(params);
      
      // Handle response structure: {success, data: {items, pagination}}
      const categoriesData = response.data?.items || response.items || [];
      const pagination = response.data?.pagination || response.pagination || {};
      
      // Map camelCase fields to snake_case for UI consistency
      const mappedCategories = categoriesData.map(cat => ({
        id: cat.id,
        code: cat.code,
        name: cat.name,
        description: cat.description,
        is_active: cat.isActive,
        subcategory_count: cat.subcategoryCount || 0,
        created_at: cat.createdAt,
        updated_at: cat.updatedAt,
      }));
      
      setCategories(mappedCategories);
      setTotalCount(pagination.total || 0);
    } catch (error) {
      showError('Failed to load categories');
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setFormDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setFormDialogOpen(true);
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (category) => {
    setSelectedCategory(category);
    setDetailsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    
    try {
      await pmsService.deleteCategory(selectedCategory.id);
      showSuccess('Category deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete category';
      showError(message);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page on search
  };

  if (isLoading && categories.length === 0) {
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>
          Categories
        </Typography>
        {hasPermission('categories.create') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCategory}
            sx={{ textTransform: 'none' }}
          >
            New Category
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="table">
                <Tooltip title="Table View">
                  <ViewListIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="card">
                <Tooltip title="Card View">
                  <ViewModuleIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <IconButton onClick={fetchCategories} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Card>

      {/* Table */}
      {viewMode === 'table' ? (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Subcategories</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow 
                    key={category.id} 
                    hover
                    onClick={() => handleViewDetails(category)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                        {category.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{category.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.is_active ? 'Active' : 'Inactive'}
                        color={category.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {category.subcategory_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(category)}
                          sx={{
                            '&:hover': {
                              bgcolor: 'info.lighter',
                              color: 'info.main',
                            },
                          }}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {hasPermission('categories.update') && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditCategory(category)}
                            sx={{
                              ml: 1,
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
                      {hasPermission('categories.delete') && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCategory(category)}
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
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No categories found matching your filters'
                          : 'No categories yet. Create your first category to get started.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Card>
      ) : (
        <Box>
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => handleViewDetails(category)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        fontWeight={600}
                        sx={{
                          bgcolor: 'grey.100',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {category.code}
                      </Typography>
                      <Chip
                        label={category.is_active ? 'Active' : 'Inactive'}
                        color={category.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {category.name}
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.5em',
                      }}
                    >
                      {category.description || 'No description'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Subcategories:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {category.subcategory_count || 0}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }} onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      startIcon={<InfoIcon />}
                      onClick={() => handleViewDetails(category)}
                      sx={{ textTransform: 'none' }}
                    >
                      Details
                    </Button>
                    {hasPermission('categories.update') && (
                      <IconButton
                        size="small"
                        onClick={() => handleEditCategory(category)}
                        sx={{
                          ml: 'auto',
                          '&:hover': {
                            bgcolor: 'primary.lighter',
                            color: 'primary.main',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {hasPermission('categories.delete') && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCategory(category)}
                        sx={{
                          '&:hover': {
                            bgcolor: 'error.lighter',
                            color: 'error.main',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {categories.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || statusFilter !== 'all'
                  ? 'No categories found matching your filters'
                  : 'No categories yet. Create your first category to get started.'}
              </Typography>
            </Box>
          )}
          
          <Card sx={{ mt: 2 }}>
            <TablePagination
              rowsPerPageOptions={[6, 12, 24, 48]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </Card>
        </Box>
      )}

      {/* Dialogs */}
      <CategoryFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        category={selectedCategory}
        onSuccess={fetchCategories}
      />

      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        category={selectedCategory}
        onConfirm={handleDeleteConfirm}
      />

      <CategoryDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        category={selectedCategory}
      />
    </Box>
  );
};

export default CategoriesListPage;

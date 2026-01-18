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
  Info as InfoIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { useUI } from '../../../contexts/UIContext';
import { useAuth } from '../../../contexts/AuthContext';
import pmsService from '../../../services/pmsService';
import SubCategoryFormDialog from '../components/SubCategoryFormDialog';
import SubCategoryDeleteDialog from '../components/SubCategoryDeleteDialog';
import SubCategoryDetailsDialog from '../components/SubCategoryDetailsDialog';

const SubCategoriesListPage = () => {
  const { showError, showSuccess } = useUI();
  const { hasPermission } = useAuth();
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubCategories();
  }, [categoryFilter, statusFilter, searchTerm, page, rowsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await pmsService.getCategories({ isActive: true });
      const categoriesData = response.data?.items || response.items || [];
      // Map camelCase to snake_case
      const mappedCategories = categoriesData.map(cat => ({
        id: cat.id,
        code: cat.code,
        name: cat.name,
        is_active: cat.isActive,
      }));
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      
      if (categoryFilter !== 'all') {
        params.category_id = categoryFilter;
      }
      
      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active';
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await pmsService.getSubCategories(params);
      const subcategoriesData = response.data?.items || response.items || [];
      const pagination = response.data?.pagination || response.pagination || {};
      
      // Map camelCase to snake_case
      const mappedSubcategories = subcategoriesData.map(sub => ({
        id: sub.id,
        code: sub.code,
        name: sub.name,
        description: sub.description,
        category_id: sub.categoryId,
        category_name: sub.categoryName,
        category_code: sub.categoryCode,
        is_active: sub.isActive,
        created_at: sub.createdAt,
        updated_at: sub.updatedAt,
      }));
      
      setSubcategories(mappedSubcategories);
      setTotalCount(pagination.total || 0);
    } catch (error) {
      showError('Failed to load subcategories');
      console.error('Error fetching subcategories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubCategory = () => {
    setSelectedSubCategory(null);
    setFormDialogOpen(true);
  };

  const handleEditSubCategory = (subcategory) => {
    setSelectedSubCategory(subcategory);
    setFormDialogOpen(true);
  };

  const handleDeleteSubCategory = (subcategory) => {
    setSelectedSubCategory(subcategory);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (subcategory) => {
    setSelectedSubCategory(subcategory);
    setDetailsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubCategory) return;
    
    try {
      await pmsService.deleteSubCategory(selectedSubCategory.id);
      showSuccess('Subcategory deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedSubCategory(null);
      fetchSubCategories();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete subcategory';
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
    setPage(0);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  if (isLoading && subcategories.length === 0) {
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>
          Subcategories
        </Typography>
        {hasPermission('subcategories.create') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateSubCategory}
            sx={{ textTransform: 'none' }}
          >
            New Subcategory
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search subcategories..."
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

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
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

            <IconButton onClick={fetchSubCategories} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Card>

      {/* Table/Card View */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
      {viewMode === 'table' ? (
        <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subcategories.map((subcategory) => (
                <TableRow 
                  key={subcategory.id} 
                  hover
                  onClick={() => handleViewDetails(subcategory)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                      {subcategory.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{subcategory.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getCategoryName(subcategory.category_id)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {subcategory.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={subcategory.is_active ? 'Active' : 'Inactive'}
                      color={subcategory.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(subcategory)}
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
                    {hasPermission('subcategories.update') && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditSubCategory(subcategory)}
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
                    {hasPermission('subcategories.delete') && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSubCategory(subcategory)}
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
              {subcategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                        ? 'No subcategories found matching your filters'
                        : 'No subcategories yet. Create your first subcategory to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
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
      ) : (
        <Box>
          <Grid container spacing={2}>
            {subcategories.map((subcategory) => (
              <Grid item xs={12} sm={6} md={4} key={subcategory.id}>
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
                  onClick={() => handleViewDetails(subcategory)}
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
                        {subcategory.code}
                      </Typography>
                      <Chip
                        label={subcategory.is_active ? 'Active' : 'Inactive'}
                        color={subcategory.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {subcategory.name}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={getCategoryName(subcategory.category_id)}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.5em',
                      }}
                    >
                      {subcategory.description || 'No description'}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }} onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      startIcon={<InfoIcon />}
                      onClick={() => handleViewDetails(subcategory)}
                      sx={{ textTransform: 'none' }}
                    >
                      Details
                    </Button>
                    {hasPermission('subcategories.update') && (
                      <IconButton
                        size="small"
                        onClick={() => handleEditSubCategory(subcategory)}
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
                    {hasPermission('subcategories.delete') && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteSubCategory(subcategory)}
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
          
          {subcategories.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'No subcategories found matching your filters'
                  : 'No subcategories yet. Create your first subcategory to get started.'}
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
      </Box>

      {/* Dialogs */}
      <SubCategoryFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        subcategory={selectedSubCategory}
        categories={categories}
        onSuccess={fetchSubCategories}
      />

      <SubCategoryDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        subcategory={selectedSubCategory}
        onConfirm={handleDeleteConfirm}
      />

      <SubCategoryDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        subcategory={selectedSubCategory}
      />
    </Box>
  );
};

export default SubCategoriesListPage;

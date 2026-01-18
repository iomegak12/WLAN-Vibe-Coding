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
  QrCode as QrCodeIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useUI } from '../../../contexts/UIContext';
import { useAuth } from '../../../contexts/AuthContext';
import pmsService from '../../../services/pmsService';
import ProductDetailsDialog from '../components/ProductDetailsDialogEnhanced';
import ProductFormDialog from '../components/ProductFormDialogStepper';
import ProductDeleteDialog from '../components/ProductDeleteDialog';

const ProductsListPage = () => {
  const { showError, showSuccess } = useUI();
  const { hasPermission } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryFilter !== 'all') {
      fetchSubcategories(categoryFilter);
    } else {
      setSubcategories([]);
      setSubcategoryFilter('all');
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, subcategoryFilter, statusFilter, brandFilter, searchTerm, page, rowsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await pmsService.getCategories({ isActive: true });
      const categoriesData = response.data?.items || response.items || [];
      const mappedCategories = categoriesData.map(cat => ({
        id: cat.id,
        name: cat.name,
      }));
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await pmsService.getSubCategories({ category_id: categoryId, isActive: true });
      const subcategoriesData = response.data?.items || response.items || [];
      const mappedSubcategories = subcategoriesData.map(sub => ({
        id: sub.id,
        name: sub.name,
      }));
      setSubcategories(mappedSubcategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      
      if (categoryFilter !== 'all') {
        params.category_id = categoryFilter;
      }
      
      if (subcategoryFilter !== 'all') {
        params.subcategory_id = subcategoryFilter;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (brandFilter) {
        params.brand = brandFilter;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await pmsService.getProducts(params);
      const productsData = response.data?.items || response.items || [];
      const pagination = response.data?.pagination || response.pagination || {};
      
      // Map camelCase to snake_case for UI consistency
      const mappedProducts = productsData.map(product => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        category_name: product.categoryName,
        subcategory_name: product.subCategoryName,
        brand: product.brand,
        model: product.model || '-',
        price: parseFloat(product.unitPrice) || 0,
        currency: product.currency || 'INR',
        status: product.isActive ? 'Active' : 'Inactive',
        created_at: product.createdAt,
        updated_at: product.updatedAt,
        images: product.images || [],
        description: product.description || '',
        warranty: product.warranty || '',
      }));
      
      setProducts(mappedProducts);
      setTotalCount(pagination.total || 0);
    } catch (error) {
      showError('Failed to load products');
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setDetailsDialogOpen(true);
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setFormDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormDialogOpen(true);
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await pmsService.deleteProduct(selectedProduct.id);
      showSuccess('Product deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete product');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatPrice = (price, currency = 'INR') => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(numPrice);
  };

  if (isLoading && products.length === 0) {
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
          Products
        </Typography>
        {hasPermission('products.create') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProduct}
            sx={{ textTransform: 'none' }}
          >
            New Product
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              placeholder="Search by SKU/Name..."
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
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
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Subcategory</InputLabel>
              <Select
                value={subcategoryFilter}
                label="Subcategory"
                onChange={(e) => {
                  setSubcategoryFilter(e.target.value);
                  setPage(0);
                }}
                disabled={categoryFilter === 'all'}
              >
                <MenuItem value="all">All Subcategories</MenuItem>
                {subcategories.map((subcategory) => (
                  <MenuItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              placeholder="Brand filter..."
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value);
                setPage(0);
              }}
              size="small"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6} md={1} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
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

            <IconButton onClick={fetchProducts} size="small">
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Card>

      {/* Table/Card View */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
      {viewMode === 'table' ? (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={80}>Image</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Brand / Model</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow 
                    key={product.id} 
                    hover
                    onClick={() => handleViewDetails(product)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      {product.images && product.images.length > 0 ? (
                        <Box
                          sx={{
                            position: 'relative',
                            width: 56,
                            height: 56,
                            borderRadius: 1,
                            overflow: 'hidden',
                            bgcolor: 'grey.100',
                          }}
                        >
                          <Box
                            component="img"
                            src={product.images[0]}
                            alt={product.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 1,
                            bgcolor: 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <InventoryIcon sx={{ color: 'grey.400', fontSize: 24 }} />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                        {product.sku}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{product.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{product.category_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.subcategory_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{product.brand}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.model}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatPrice(product.price, product.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.status}
                        color={getStatusColor(product.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(product.updated_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(product)}
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
                      {hasPermission('products.update') && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditProduct(product)}
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
                      {hasPermission('products.delete') && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteProduct(product)}
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
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || brandFilter
                          ? 'No products found matching your filters'
                          : 'No products yet. Create your first product to get started.'}
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
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
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
                  onClick={() => handleViewDetails(product)}
                >
                  {/* Product Image */}
                  {product.images && product.images.length > 0 ? (
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '60%', // 5:3 aspect ratio
                        overflow: 'hidden',
                        bgcolor: 'grey.100',
                      }}
                    >
                      <Box
                        component="img"
                        src={product.images[0]}
                        alt={product.name}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      {product.images.length > 1 && (
                        <Chip
                          label={`+${product.images.length - 1}`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                          }}
                        />
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '60%',
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <InventoryIcon
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: 60,
                          color: 'grey.400',
                        }}
                      />
                    </Box>
                  )}

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
                        {product.sku}
                      </Typography>
                      <Chip
                        label={product.status}
                        color={getStatusColor(product.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {product.name}
                    </Typography>

                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {product.category_name} › {product.subcategory_name}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {product.brand} {product.model}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      {formatPrice(product.price, product.currency)}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }} onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      startIcon={<InfoIcon />}
                      onClick={() => handleViewDetails(product)}
                      sx={{ textTransform: 'none' }}
                    >
                      Details
                    </Button>
                    {hasPermission('products.update') && (
                      <IconButton
                        size="small"
                        onClick={() => handleEditProduct(product)}
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
                    {hasPermission('products.delete') && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProduct(product)}
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
          
          {products.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || brandFilter
                  ? 'No products found matching your filters'
                  : 'No products yet. Create your first product to get started.'}
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

      {/* Details Dialog */}
      <ProductDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        product={selectedProduct}
      />

      {/* Form Dialog */}
      <ProductFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        product={selectedProduct}
        onSuccess={fetchProducts}
      />

      {/* Delete Dialog */}
      <ProductDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        product={selectedProduct}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};

export default ProductsListPage;

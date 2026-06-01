import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, TextField,
  InputAdornment, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, Skeleton, DialogContentText, Alert, Chip,
  Tooltip, Grid, Fade
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, Edit as EditIcon,
  Delete as DeleteIcon, Warning as WarningIcon, Inventory as InventoryIcon,
  Close as CloseIcon, QrCode as SkuIcon, AttachMoney as PriceIcon,
  Layers as StockIcon, Label as NameIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { productApi } from '../services/api';
import { useNotification } from '../App';
import { useHeaderAction } from '../components/Layout';

function StockBadge({ qty }) {
  if (qty === 0) return <Chip label="Out of Stock" size="small" color="error" sx={{ fontWeight: 700, borderRadius: 1.5 }} />;
  if (qty <= 10) return <Chip label={`Low: ${qty}`} size="small" color="warning" sx={{ fontWeight: 700, borderRadius: 1.5 }} />;
  return <Chip label={qty} size="small" color="success" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1.5 }} />;
}

export function Products() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showNotification } = useNotification();
  const { setHeaderAction } = useHeaderAction();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const skip = page * rowsPerPage;
      const data = await productApi.getAll({ skip, limit: rowsPerPage, search });
      setProducts(data.items);
      setTotal(data.total);
    } catch (err) {
      showNotification(err.message || 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [page, rowsPerPage, search]);

  // Inject "Add Product" button into the AppBar
  useEffect(() => {
    setHeaderAction(
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpenCreate}
        size="small"
        sx={{ borderRadius: 2, px: 2, fontWeight: 600, fontSize: 13 }}
      >
        Add Product
      </Button>
    );
    return () => setHeaderAction(null);
  }, []);  // eslint-disable-line

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setSubmitError('');
    reset({ sku: '', name: '', description: '', price: '', stock_quantity: '' });
    setFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setSubmitError('');
    reset({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price),
      stock_quantity: product.stock_quantity
    });
    setFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        stock_quantity: parseInt(data.stock_quantity, 10)
      };
      if (selectedProduct) {
        await productApi.update(selectedProduct.id, payload);
        showNotification('Product updated successfully', 'success');
      } else {
        await productApi.create(payload);
        showNotification('Product added successfully', 'success');
      }
      setFormOpen(false);
      fetchProducts();
    } catch (err) {
      setSubmitError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await productApi.delete(selectedProduct.id);
      showNotification('Product deleted', 'success');
      setDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      showNotification(err.message || 'Failed to delete product', 'error');
      setDeleteOpen(false);
    }
  };

  return (
    <Fade in={true} timeout={400}>
      <Box>
        {/* Search */}
        <Card sx={{ mb: 3, p: 2 }}>
          <TextField
            fullWidth size="small"
            placeholder="Search by SKU, name or description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>,
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setSearch(''); setPage(0); }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
        </Card>

        {/* Table */}
        <TableContainer component={Card}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center" sx={{ width: 100 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[80, 140, 200, 60, 80, 70].map((w, j) => (
                      <TableCell key={j} align={j === 3 ? 'right' : j === 4 || j === 5 ? 'center' : 'left'}>
                        <Skeleton width={w} sx={{ mx: j >= 3 ? 'auto' : 0 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <InventoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                      {search ? 'No products match your search' : 'No products yet'}
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                      {!search && 'Click "Add Product" to get started'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} sx={{ '&:hover': { bgcolor: 'action.hover' }, transition: 'background-color 0.15s' }}>
                    <TableCell>
                      <Chip label={p.sku} size="small" variant="outlined" color="primary"
                        sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 11, borderRadius: 1.5 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Tooltip title={p.description || ''} placement="top">
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {p.description || '—'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700} color="text.primary">
                        ₹{parseFloat(p.price).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <StockBadge qty={p.stock_quantity} />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Edit product">
                          <IconButton size="small" onClick={() => handleOpenEdit(p)} color="primary"
                            sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, width: 30, height: 30 }}>
                            <EditIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete product">
                          <IconButton size="small" onClick={() => { setSelectedProduct(p); setDeleteOpen(true); }}
                            sx={{ bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' }, width: 30, height: 30 }}>
                            <DeleteIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </TableContainer>

        {/* Add / Edit Dialog */}
        <Dialog open={formOpen} onClose={() => !submitting && setFormOpen(false)} maxWidth="sm" fullWidth
          TransitionComponent={Fade} TransitionProps={{ timeout: 200 }}>
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <InventoryIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {selectedProduct ? 'Edit Product' : 'Add New Product'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedProduct ? `Editing ${selectedProduct.name}` : 'Fill in the product details below'}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <DialogContent sx={{ pt: 2 }}>
              {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{submitError}</Alert>}
              <Stack spacing={2.5}>
                <TextField fullWidth label="SKU" placeholder="e.g. PROD-001-BLK"
                  disabled={!!selectedProduct}
                  {...register('sku', {
                    required: 'SKU is required',
                    pattern: { value: /^[A-Z0-9_-]+$/i, message: 'Only letters, numbers, hyphens and underscores' }
                  })}
                  error={!!errors.sku} helperText={errors.sku?.message || (selectedProduct ? 'SKU cannot be changed' : '')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SkuIcon fontSize="small" color="action" /></InputAdornment> }}
                />
                <TextField fullWidth label="Product Name" placeholder="e.g. Wireless Headphones"
                  {...register('name', { required: 'Product name is required' })}
                  error={!!errors.name} helperText={errors.name?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start"><NameIcon fontSize="small" color="action" /></InputAdornment> }}
                />
                <TextField fullWidth label="Description" placeholder="Brief product description..."
                  multiline rows={2} {...register('description')}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Price (₹)" type="number"
                      inputProps={{ step: '0.01', min: '0.01' }} placeholder="0.00"
                      {...register('price', {
                        required: 'Price is required',
                        min: { value: 0.01, message: 'Must be > 0' }
                      })}
                      error={!!errors.price} helperText={errors.price?.message}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PriceIcon fontSize="small" color="action" /></InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Stock Quantity" type="number"
                      inputProps={{ min: '0' }} placeholder="0"
                      {...register('stock_quantity', {
                        required: 'Stock quantity is required',
                        min: { value: 0, message: 'Cannot be negative' }
                      })}
                      error={!!errors.stock_quantity} helperText={errors.stock_quantity?.message}
                      InputProps={{ startAdornment: <InputAdornment position="start"><StockIcon fontSize="small" color="action" /></InputAdornment> }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button onClick={() => setFormOpen(false)} variant="outlined" disabled={submitting} sx={{ flex: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ flex: 1 }}>
                {submitting ? 'Saving...' : selectedProduct ? 'Save Changes' : 'Add Product'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirm */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <WarningIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={700}>Delete Product?</Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will permanently delete <strong>{selectedProduct?.name}</strong> (SKU: {selectedProduct?.sku}).
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => setDeleteOpen(false)} variant="outlined" sx={{ flex: 1 }}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ flex: 1 }}>Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}

export default Products;

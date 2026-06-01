import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, Skeleton,
  Chip, FormControl, InputLabel, Select, MenuItem, TextField, Grid,
  Divider, Alert, Tooltip, Avatar, Fade, Paper
} from '@mui/material';
import {
  Add as AddIcon, Visibility as ViewIcon,
  AddCircleOutline as AddItemIcon, CheckCircle as ConfirmIcon,
  Cancel as CancelIcon, ShoppingCart as CartIcon,
  Person as PersonIcon, Inventory as ProductIcon,
  Receipt as ReceiptIcon, Close as CloseIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { orderApi, customerApi, productApi } from '../services/api';
import { useNotification } from '../App';
import { useHeaderAction } from '../components/Layout';

const STATUS_CONFIG = {
  Confirmed: { color: 'success', label: 'Confirmed' },
  Cancelled: { color: 'error', label: 'Cancelled' },
  Pending: { color: 'warning', label: 'Pending' },
};

function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <Chip label={cfg.label} size="small" color={cfg.color}
      sx={{ fontWeight: 700, borderRadius: 1.5, minWidth: 80 }} />
  );
}

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Create order form state
  const [orderCustomerId, setOrderCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showNotification } = useNotification();
  const { setHeaderAction } = useHeaderAction();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const skip = page * rowsPerPage;
      const data = await orderApi.getAll({ skip, limit: rowsPerPage });
      setOrders(data.items);
      setTotal(data.total);
    } catch (err) {
      showNotification(err.message || 'Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const [custData, prodData] = await Promise.all([
        customerApi.getAll({ limit: 1000 }),
        productApi.getAll({ limit: 1000 })
      ]);
      setCustomers(custData.items);
      setProducts(prodData.items);
    } catch (err) {
      console.error('Failed to load form options:', err);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, rowsPerPage]);
  useEffect(() => { if (createOpen) fetchFormOptions(); }, [createOpen]);

  // Inject "New Order" button into the AppBar
  useEffect(() => {
    setHeaderAction(
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpenCreate}
        size="small"
        sx={{ borderRadius: 2, px: 2, fontWeight: 600, fontSize: 13 }}
      >
        New Order
      </Button>
    );
    return () => setHeaderAction(null);
  }, []); // eslint-disable-line

  const handleOpenCreate = () => {
    setOrderCustomerId('');
    setOrderItems([]);
    setSelectedProductId('');
    setSelectedQuantity(1);
    setSubmitError('');
    setCreateOpen(true);
  };

  const handleOpenDetails = async (order) => {
    try {
      const details = await orderApi.getById(order.id);
      setSelectedOrder(details);
      setDetailsOpen(true);
    } catch (err) {
      showNotification(err.message || 'Failed to load order details', 'error');
    }
  };

  const handleAddLineItem = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const existingIndex = orderItems.findIndex(i => i.product_id === selectedProductId);
    const totalQty = existingIndex > -1
      ? orderItems[existingIndex].quantity + selectedQuantity
      : selectedQuantity;

    if (product.stock_quantity < totalQty) {
      setSubmitError(`Not enough stock for "${product.name}". Available: ${product.stock_quantity}`);
      return;
    }

    setSubmitError('');
    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity = totalQty;
      setOrderItems(updated);
    } else {
      setOrderItems([...orderItems, { product_id: selectedProductId, quantity: selectedQuantity, product }]);
    }
    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const orderTotal = orderItems.reduce((sum, item) =>
    sum + parseFloat(item.product.price) * item.quantity, 0);

  const handleCreateOrder = async () => {
    if (!orderCustomerId) { setSubmitError('Please select a customer.'); return; }
    if (orderItems.length === 0) { setSubmitError('Please add at least one product.'); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      await orderApi.create({
        customer_id: orderCustomerId,
        items: orderItems.map(i => ({
          product_id: parseInt(i.product_id, 10),
          quantity: parseInt(i.quantity, 10)
        }))
      });
      showNotification('Order created successfully!', 'success');
      setCreateOpen(false);
      fetchOrders();
    } catch (err) {
      setSubmitError(err.message || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updated = await orderApi.updateStatus(orderId, newStatus);
      showNotification(`Order marked as ${newStatus}`, 'success');
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
      fetchOrders();
    } catch (err) {
      showNotification(err.message || 'Failed to update status', 'error');
    }
  };

  const selectedProductObj = products.find(p => p.id === selectedProductId);

  return (
    <Fade in={true} timeout={400}>
      <Box>
        {/* Orders Table */}
        <TableContainer component={Card}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center" sx={{ width: 80 }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[60, 140, 70, 90, 120, 50].map((w, j) => (
                      <TableCell key={j} align={j === 2 ? 'right' : j === 3 || j === 5 ? 'center' : 'left'}>
                        <Skeleton width={w} sx={{ mx: j >= 2 ? 'auto' : 0 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>No orders yet</Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                      Click "New Order" to place your first order
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} sx={{ '&:hover': { bgcolor: 'action.hover' }, transition: 'background-color 0.15s' }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        #ORD-{String(order.id).padStart(4, '0')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}>
                          {order.customer?.full_name?.charAt(0) || '?'}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {order.customer?.full_name || `Customer #${order.customer_id}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700}>
                        ₹{parseFloat(order.total_amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip status={order.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {new Date(order.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => handleOpenDetails(order)}
                          sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, width: 30, height: 30 }}>
                          <ViewIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
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

        {/* ── Create Order Dialog ── */}
        <Dialog open={createOpen} onClose={() => !submitting && setCreateOpen(false)}
          maxWidth="md" fullWidth TransitionComponent={Fade} TransitionProps={{ timeout: 200 }}>
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <ReceiptIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>Create New Order</Typography>
                <Typography variant="caption" color="text.secondary">Select a customer and add products</Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            {submitError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{submitError}</Alert>}

            <Grid container spacing={3}>
              {/* Left: Customer + Product picker */}
              <Grid item xs={12} md={5}>
                <Stack spacing={2.5}>
                  {/* Customer */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon fontSize="small" /> Customer
                    </Typography>
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Customer</InputLabel>
                      <Select value={orderCustomerId} label="Select Customer"
                        onChange={(e) => setOrderCustomerId(e.target.value)}>
                        {customers.length === 0 ? (
                          <MenuItem disabled>Loading customers...</MenuItem>
                        ) : customers.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 22, height: 22, fontSize: 11, bgcolor: 'primary.main' }}>
                                {c.full_name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>{c.full_name}</Typography>
                                <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Divider />

                  {/* Product picker */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ProductIcon fontSize="small" /> Add Product
                    </Typography>
                    <Stack spacing={1.5}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Select Product</InputLabel>
                        <Select value={selectedProductId} label="Select Product"
                          onChange={(e) => setSelectedProductId(e.target.value)}>
                          {products.length === 0 ? (
                            <MenuItem disabled>Loading products...</MenuItem>
                          ) : products.map((p) => (
                            <MenuItem key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                              <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                                  <Typography variant="body2" fontWeight={700} color="primary.main">
                                    ₹{parseFloat(p.price).toFixed(2)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="caption" color="text.secondary">{p.sku}</Typography>
                                  <Typography variant="caption" color={p.stock_quantity <= 10 ? 'warning.main' : 'text.secondary'}>
                                    Stock: {p.stock_quantity}
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {selectedProductObj && (
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                          <Typography variant="caption" color="text.secondary">Selected:</Typography>
                          <Typography variant="body2" fontWeight={600}>{selectedProductObj.name}</Typography>
                          <Typography variant="caption" color="primary.main">₹{parseFloat(selectedProductObj.price).toFixed(2)} each · {selectedProductObj.stock_quantity} in stock</Typography>
                        </Paper>
                      )}

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label="Qty" type="number" size="small"
                          inputProps={{ min: 1, max: selectedProductObj?.stock_quantity || 9999 }}
                          value={selectedQuantity}
                          onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          sx={{ width: 90 }}
                        />
                        <Button
                          variant="outlined" startIcon={<AddItemIcon />}
                          onClick={handleAddLineItem}
                          disabled={!selectedProductId}
                          fullWidth
                        >
                          Add to Order
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>

              {/* Right: Line items + summary */}
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CartIcon fontSize="small" /> Order Items
                  {orderItems.length > 0 && (
                    <Chip label={orderItems.length} size="small" color="primary" sx={{ ml: 1, height: 18, fontSize: 11 }} />
                  )}
                </Typography>

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 240, overflow: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Unit</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center" sx={{ width: 40 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                            <CartIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 0.5 }} />
                            <Typography variant="body2" color="text.disabled">No items added yet</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        orderItems.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>{item.product.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.product.sku}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={item.quantity} size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1 }} />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">₹{parseFloat(item.product.price).toFixed(2)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={700}>
                                ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton size="small" color="error" onClick={() => handleRemoveItem(idx)}>
                                <CloseIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Order Summary */}
                <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {orderItems.length} item{orderItems.length !== 1 ? 's' : ''}
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="primary.main">
                        ₹{orderTotal.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">Grand Total</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {orderCustomerId
                          ? `For: ${customers.find(c => c.id === orderCustomerId)?.full_name || ''}`
                          : 'No customer selected'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => setCreateOpen(false)} variant="outlined" disabled={submitting} sx={{ minWidth: 100 }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              variant="contained"
              disabled={submitting || orderItems.length === 0 || !orderCustomerId}
              endIcon={<ArrowIcon />}
              sx={{ minWidth: 160 }}
            >
              {submitting ? 'Placing Order...' : `Place Order · ₹${orderTotal.toFixed(2)}`}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Order Details Dialog ── */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)}
          maxWidth="sm" fullWidth TransitionComponent={Fade} TransitionProps={{ timeout: 200 }}>
          {selectedOrder && (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <ReceiptIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Order #ORD-{String(selectedOrder.id).padStart(4, '0')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(selectedOrder.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <StatusChip status={selectedOrder.status} />
                </Box>
              </DialogTitle>

              <DialogContent dividers>
                <Stack spacing={2.5}>
                  {/* Customer info */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Customer
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {selectedOrder.customer?.full_name?.charAt(0) || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>{selectedOrder.customer?.full_name}</Typography>
                        <Typography variant="body2" color="text.secondary">{selectedOrder.customer?.email}</Typography>
                        {selectedOrder.customer?.phone && (
                          <Typography variant="body2" color="text.secondary">{selectedOrder.customer.phone}</Typography>
                        )}
                        {selectedOrder.customer?.address && (
                          <Typography variant="body2" color="text.secondary">{selectedOrder.customer.address}</Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>

                  {/* Items */}
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Items
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mt: 1, borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="center">Qty</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {item.product?.name || `Product #${item.product_id}`}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.product?.sku || ''}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={item.quantity} size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1 }} />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">₹{parseFloat(item.unit_price).toFixed(2)}</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={700}>
                                  ₹{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} sx={{ fontWeight: 700, border: 0, pt: 1.5 }}>
                              Grand Total
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, border: 0, pt: 1.5, color: 'primary.main', fontSize: 16 }}>
                              ₹{parseFloat(selectedOrder.total_amount).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Stack>
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {selectedOrder.status === 'Pending' && (
                    <Button variant="contained" color="success" size="small"
                      startIcon={<ConfirmIcon />}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Confirmed')}>
                      Confirm
                    </Button>
                  )}
                  {selectedOrder.status === 'Cancelled' && (
                    <Button variant="outlined" color="success" size="small"
                      startIcon={<ConfirmIcon />}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Confirmed')}>
                      Restore
                    </Button>
                  )}
                  {selectedOrder.status !== 'Cancelled' && (
                    <Button variant="outlined" color="error" size="small"
                      startIcon={<CancelIcon />}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Cancelled')}>
                      Cancel Order
                    </Button>
                  )}
                </Box>
                <Button onClick={() => setDetailsOpen(false)} variant="contained">Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Fade>
  );
}

export default Orders;

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, TextField,
  InputAdornment, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, Skeleton, DialogContentText, Alert, Chip,
  Avatar, Tooltip, Fade
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, Edit as EditIcon,
  Delete as DeleteIcon, Warning as WarningIcon, Person as PersonIcon,
  Email as EmailIcon, Phone as PhoneIcon, LocationOn as LocationIcon,
  Close as CloseIcon, PeopleAlt as PeopleAltIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { customerApi } from '../services/api';
import { useNotification } from '../App';
import { useHeaderAction } from '../components/Layout';

function getAvatarColor(name) {
  const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
  if (!name) return colors[0];
  return colors[name.charCodeAt(0) % colors.length];
}

export function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showNotification } = useNotification();
  const { setHeaderAction } = useHeaderAction();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const skip = page * rowsPerPage;
      const data = await customerApi.getAll({ skip, limit: rowsPerPage, search });
      setCustomers(data.items);
      setTotal(data.total);
    } catch (err) {
      showNotification(err.message || 'Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [page, rowsPerPage, search]);

  // Inject "Add Customer" button into the AppBar
  useEffect(() => {
    setHeaderAction(
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpenCreate}
        size="small"
        sx={{ borderRadius: 2, px: 2, fontWeight: 600, fontSize: 13 }}
      >
        Add Customer
      </Button>
    );
    return () => setHeaderAction(null);
  }, []); // eslint-disable-line

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setSubmitError('');
    reset({ full_name: '', email: '', phone: '', address: '' });
    setFormOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setSubmitError('');
    reset({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setSubmitError('');
    setSubmitting(true);
    try {
      if (selectedCustomer) {
        await customerApi.update(selectedCustomer.id, data);
        showNotification('Customer updated successfully', 'success');
      } else {
        await customerApi.create(data);
        showNotification('Customer added successfully', 'success');
      }
      setFormOpen(false);
      fetchCustomers();
    } catch (err) {
      setSubmitError(err.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await customerApi.delete(selectedCustomer.id);
      showNotification('Customer deleted', 'success');
      setDeleteOpen(false);
      fetchCustomers();
    } catch (err) {
      showNotification(err.message || 'Failed to delete customer', 'error');
      setDeleteOpen(false);
    }
  };

  return (
    <Fade in={true} timeout={400}>
      <Box>
        {/* Search Bar */}
        <Card sx={{ mb: 3, p: 2 }}>
          <TextField
            fullWidth size="small"
            placeholder="Search by name, email, phone or address..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>
              ),
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
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="center" sx={{ width: 100 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Skeleton variant="circular" width={36} height={36} /><Skeleton width={120} /></Box></TableCell>
                    <TableCell><Skeleton width={160} /></TableCell>
                    <TableCell><Skeleton width={200} /></TableCell>
                    <TableCell align="center"><Skeleton width={60} sx={{ mx: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <PeopleAltIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                      {search ? 'No customers match your search' : 'No customers yet'}
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                      {!search && 'Click "Add Customer" to get started'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id} sx={{ '&:hover': { bgcolor: 'action.hover' }, transition: 'background-color 0.15s' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700, bgcolor: getAvatarColor(c.full_name) }}>
                          {c.full_name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{c.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {c.phone ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary">{c.phone}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      {c.address ? (
                        <Tooltip title={c.address} placement="top">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
                            <Typography variant="body2" color="text.secondary" noWrap>{c.address}</Typography>
                          </Box>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Edit customer">
                          <IconButton size="small" onClick={() => handleOpenEdit(c)} color="primary"
                            sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, width: 30, height: 30 }}>
                            <EditIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete customer">
                          <IconButton size="small" onClick={() => { setSelectedCustomer(c); setDeleteOpen(true); }} color="error"
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
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <PersonIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedCustomer ? `Editing ${selectedCustomer.full_name}` : 'Fill in the customer details below'}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <DialogContent sx={{ pt: 2 }}>
              {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{submitError}</Alert>}
              <Stack spacing={2.5}>
                <TextField fullWidth label="Full Name" placeholder="e.g. Jane Smith"
                  {...register('full_name', { required: 'Name is required' })}
                  error={!!errors.full_name} helperText={errors.full_name?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" color="action" /></InputAdornment> }}
                />
                <TextField fullWidth label="Email Address" placeholder="jane@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email format' }
                  })}
                  error={!!errors.email} helperText={errors.email?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" color="action" /></InputAdornment> }}
                />
                <TextField fullWidth label="Phone Number" placeholder="+1 (555) 000-0000"
                  {...register('phone')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" color="action" /></InputAdornment> }}
                />
                <TextField fullWidth label="Address" placeholder="123 Main St, City, Country"
                  multiline rows={2} {...register('address')}
                  InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: '6px', alignSelf: 'flex-start' }}><LocationIcon fontSize="small" color="action" /></InputAdornment> }}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button onClick={() => setFormOpen(false)} variant="outlined" disabled={submitting} sx={{ flex: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ flex: 1 }}>
                {submitting ? 'Saving...' : selectedCustomer ? 'Save Changes' : 'Add Customer'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <WarningIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={700}>Delete Customer?</Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will permanently delete <strong>{selectedCustomer?.full_name}</strong>.
              This action cannot be undone and will fail if they have existing orders.
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

export default Customers;

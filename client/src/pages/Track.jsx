import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, TextField,
  InputAdornment, IconButton, Stack, Skeleton, Chip, Tooltip,
  FormControl, InputLabel, Select, MenuItem, Avatar, Fade, Grid, Button
} from '@mui/material';
import {
  Search as SearchIcon, Close as CloseIcon, History as HistoryIcon,
  Refresh as RefreshIcon, People as CustomersIcon, Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon, Person as UserIcon, FilterList as FilterIcon
} from '@mui/icons-material';
import { activityLogApi } from '../services/api';
import { useNotification } from '../App';

// Format entity types with icons
function EntityTypeBadge({ type }) {
  let icon = null;
  let color = 'secondary';
  
  if (type === 'Product') {
    icon = <ProductsIcon sx={{ fontSize: 13, mr: 0.5 }} />;
    color = 'info';
  } else if (type === 'Customer') {
    icon = <CustomersIcon sx={{ fontSize: 13, mr: 0.5 }} />;
    color = 'warning';
  } else if (type === 'Order') {
    icon = <OrdersIcon sx={{ fontSize: 13, mr: 0.5 }} />;
    color = 'primary';
  } else if (type === 'User') {
    icon = <UserIcon sx={{ fontSize: 13, mr: 0.5 }} />;
    color = 'success';
  }

  return (
    <Chip
      label={type}
      size="small"
      color={color}
      variant="outlined"
      icon={icon}
      sx={{ fontWeight: 600, borderRadius: 1.5 }}
    />
  );
}

// Format actions with colors
function ActionBadge({ action }) {
  let color = 'default';
  let label = action;

  if (action === 'CREATE') {
    color = 'success';
  } else if (action === 'UPDATE' || action === 'UPDATE_STATUS') {
    color = 'warning';
    label = action === 'UPDATE_STATUS' ? 'UPDATE STATUS' : 'UPDATE';
  } else if (action === 'DELETE') {
    color = 'error';
  } else if (action === 'LOGIN' || action === 'SIGNUP') {
    color = 'primary';
  }

  return (
    <Chip
      label={label}
      size="small"
      color={color}
      sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: 11 }}
    />
  );
}

export function Track() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const { showNotification } = useNotification();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const skip = page * rowsPerPage;
      
      // We will apply search and filters locally or let the search string handle filter tags
      let queryStr = search;
      if (entityFilter !== 'All') {
        queryStr += (queryStr ? ' ' : '') + entityFilter;
      }
      if (actionFilter !== 'All') {
        queryStr += (queryStr ? ' ' : '') + actionFilter;
      }

      const data = await activityLogApi.getAll({ 
        skip, 
        limit: rowsPerPage, 
        search: queryStr || undefined 
      });
      
      setLogs(data.items);
      setTotal(data.total);
    } catch (err) {
      showNotification(err.message || 'Failed to fetch activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchLogs, 300);
    return () => clearTimeout(t);
  }, [page, rowsPerPage, search, entityFilter, actionFilter]);

  const handleRefresh = () => {
    fetchLogs();
    showNotification('Logs updated', 'info');
  };

  const formatDateTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Fade in={true} timeout={400}>
      <Box>
        {/* Controls Card */}
        <Card sx={{ mb: 3, p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Bar */}
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search logs (e.g. product name, sku, email)..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" fontSize="small" />
                    </InputAdornment>
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
            </Grid>

            {/* Entity Filter */}
            <Grid item xs={6} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="entity-filter-label">Entity Type</InputLabel>
                <Select
                  labelId="entity-filter-label"
                  label="Entity Type"
                  value={entityFilter}
                  onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
                >
                  <MenuItem value="All">All Entities</MenuItem>
                  <MenuItem value="Product">Products</MenuItem>
                  <MenuItem value="Customer">Customers</MenuItem>
                  <MenuItem value="Order">Orders</MenuItem>
                  <MenuItem value="User">Users</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Action Filter */}
            <Grid item xs={6} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="action-filter-label">Action</InputLabel>
                <Select
                  labelId="action-filter-label"
                  label="Action"
                  value={actionFilter}
                  onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
                >
                  <MenuItem value="All">All Actions</MenuItem>
                  <MenuItem value="CREATE">CREATE</MenuItem>
                  <MenuItem value="UPDATE">UPDATE</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                  <MenuItem value="LOGIN">LOGIN</MenuItem>
                  <MenuItem value="SIGNUP">SIGNUP</MenuItem>
                  <MenuItem value="UPDATE_STATUS">UPDATE STATUS</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Refresh Button */}
            <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                size="medium"
                sx={{ borderRadius: 2, fontWeight: 600, width: { xs: '100%', md: 'auto' } }}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Logs Table Container */}
        <TableContainer component={Card}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3 }}>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Entity ID</TableCell>
                <TableCell>Details</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ pl: 3 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Skeleton variant="circular" width={28} height={28} />
                        <Skeleton width={100} />
                      </Stack>
                    </TableCell>
                    <TableCell><Skeleton width={60} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={40} /></TableCell>
                    <TableCell><Skeleton width={300} /></TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}><Skeleton width={140} sx={{ ml: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <HistoryIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5, opacity: 0.8 }} />
                    <Typography variant="body1" color="text.secondary" fontWeight={600}>
                      No history found
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                      {search || entityFilter !== 'All' || actionFilter !== 'All' 
                        ? 'Try loosening your filter parameters' 
                        : 'Any changes or events in the inventory system will show up here.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const userInitial = log.user_name ? log.user_name.charAt(0).toUpperCase() : 'S';
                  return (
                    <TableRow 
                      key={log.id} 
                      sx={{ '&:hover': { bgcolor: 'action.hover' }, transition: 'background-color 0.15s' }}
                    >
                      {/* User Cell */}
                      <TableCell sx={{ pl: 3 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar 
                            sx={{ 
                              width: 28, height: 28, fontSize: 11, fontWeight: 700,
                              background: log.user_id 
                                ? 'linear-gradient(135deg, #4F6EF7, #7B93FF)'
                                : 'linear-gradient(135deg, #94A3B8, #CBD5E1)'
                            }}
                          >
                            {userInitial}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {log.user_name || 'System / Guest'}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Action Cell */}
                      <TableCell>
                        <ActionBadge action={log.action} />
                      </TableCell>

                      {/* Entity Cell */}
                      <TableCell>
                        <EntityTypeBadge type={log.entity_type} />
                      </TableCell>

                      {/* Entity ID Cell */}
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {log.entity_id || '—'}
                      </TableCell>

                      {/* Details Cell */}
                      <TableCell sx={{ maxWidth: 350 }}>
                        <Typography variant="body2" color="text.secondary">
                          {log.details || '—'}
                        </Typography>
                      </TableCell>

                      {/* Timestamp Cell */}
                      <TableCell align="right" sx={{ pr: 3, whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {formatDateTime(log.created_at)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
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
      </Box>
    </Fade>
  );
}

export default Track;

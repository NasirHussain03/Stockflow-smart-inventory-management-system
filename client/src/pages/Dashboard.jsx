import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Skeleton,
  useTheme, Alert, Button, Stack, alpha, Chip, Fade
} from '@mui/material';
import {
  Inventory as ProductsIcon, People as CustomersIcon,
  ShoppingCart as OrdersIcon, Warning as LowStockIcon,
  Refresh as RefreshIcon, TrendingUp, ArrowUpward, ArrowDownward
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { dashboardApi } from '../services/api';
import { useNotification } from '../App';

const STAT_CARDS = [
  {
    key: 'total_products',
    title: 'Total Products',
    icon: ProductsIcon,
    color: '#4F6EF7',
    bg: '#EEF2FF',
    darkBg: 'rgba(79,110,247,0.12)',
    suffix: 'items',
  },
  {
    key: 'total_customers',
    title: 'Customers',
    icon: CustomersIcon,
    color: '#10B981',
    bg: '#ECFDF5',
    darkBg: 'rgba(16,185,129,0.12)',
    suffix: 'records',
  },
  {
    key: 'total_orders',
    title: 'Total Orders',
    icon: OrdersIcon,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    darkBg: 'rgba(139,92,246,0.12)',
    suffix: 'placed',
  },
  {
    key: 'low_stock_products',
    title: 'Low Stock',
    icon: LowStockIcon,
    color: '#F43F5E',
    bg: '#FFF1F2',
    darkBg: 'rgba(244,63,94,0.12)',
    suffix: 'alerts',
    alert: true,
  },
];

function StatCard({ card, value, loading, isDark }) {
  const Icon = card.icon;
  const isAlert = card.alert && value > 0;

  return (
    <Card sx={{
      height: '100%',
      background: isDark
        ? `linear-gradient(135deg, ${card.darkBg} 0%, transparent 100%)`
        : `linear-gradient(135deg, ${alpha(card.color, 0.04)} 0%, transparent 100%)`,
      border: `1px solid ${isDark ? alpha(card.color, 0.15) : alpha(card.color, 0.12)}`,
      position: 'relative', overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 24px ${alpha(card.color, 0.15)}`,
      },
    }}>
      {/* Decorative circle */}
      <Box sx={{
        position: 'absolute', right: -20, top: -20,
        width: 100, height: 100, borderRadius: '50%',
        bgcolor: alpha(card.color, isDark ? 0.08 : 0.06),
        pointerEvents: 'none',
      }} />
      <CardContent sx={{ p: 2.5 }}>
        {loading ? (
          <Stack spacing={1}>
            <Skeleton width="55%" height={16} />
            <Skeleton width="40%" height={36} />
            <Skeleton width="30%" height={14} />
          </Stack>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: 2,
                bgcolor: isDark ? alpha(card.color, 0.2) : card.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon sx={{ fontSize: 20, color: card.color }} />
              </Box>
              {isAlert && (
                <Chip label="Action needed" size="small" color="error"
                  sx={{ fontSize: 10, height: 20, fontWeight: 700 }} />
              )}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: isAlert ? 'error.main' : 'text.primary', mb: 0.25 }}>
              {value ?? 0}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {card.title}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {card.suffix}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: isDark ? '#1A2235' : '#fff',
      border: `1px solid ${isDark ? '#1E2A3B' : '#E8EEFF'}`,
      borderRadius: 2, p: 1.5,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
          <Typography variant="caption" fontWeight={600}>
            {p.name}: {p.name === 'Revenue (₹)' ? `₹${Number(p.value).toFixed(2)}` : p.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { showNotification } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await dashboardApi.getStats());
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
      showNotification('Error loading dashboard statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3, mt: 2 }}
        action={<Button color="inherit" size="small" onClick={fetchData} startIcon={<RefreshIcon />}>Retry</Button>}>
        {error}
      </Alert>
    );
  }

  const totalRevenue = data?.orders_by_day?.reduce((s, d) => s + d.revenue, 0) ?? 0;

  return (
    <Fade in={true} timeout={400}>
      <Box>
        {/* Header row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Overview</Typography>
            <Typography variant="body2" color="text.secondary">
              Your personal workspace summary
            </Typography>
          </Box>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />}
            onClick={fetchData} disabled={loading}
            sx={{ borderRadius: 2, fontWeight: 600 }}>
            Refresh
          </Button>
        </Box>

        {/* Revenue banner */}
        {!loading && totalRevenue > 0 && (
          <Card sx={{
            mb: 3, p: 2.5,
            background: isDark
              ? 'linear-gradient(135deg, rgba(79,110,247,0.2) 0%, rgba(139,92,246,0.15) 100%)'
              : 'linear-gradient(135deg, #4F6EF7 0%, #8B5CF6 100%)',
            border: 'none',
            color: '#fff',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                  Total Revenue (Last 30 Days)
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box sx={{
                width: 56, height: 56, borderRadius: 3,
                bgcolor: alpha('#fff', 0.15),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingUp sx={{ fontSize: 28 }} />
              </Box>
            </Box>
          </Card>
        )}

        {/* KPI cards */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {STAT_CARDS.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.key}>
              <StatCard card={card} value={data?.[card.key]} loading={loading} isDark={isDark} />
            </Grid>
          ))}
        </Grid>

        {/* Charts */}
        <Grid container spacing={2.5}>
          {/* Revenue chart */}
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 2.5, height: 380 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Revenue Trend</Typography>
                  <Typography variant="caption" color="text.secondary">Last 30 days · confirmed orders</Typography>
                </Box>
                <Chip label="30d" size="small" variant="outlined" sx={{ fontWeight: 600, borderRadius: 1.5 }} />
              </Box>
              {loading ? (
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data?.orders_by_day || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#4F6EF7" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4F6EF7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="date"
                      tickFormatter={(s) => { const d = new Date(s); return isNaN(d) ? s : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }}
                      stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} tickLine={false} axisLine={false}
                    />
                    <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue (₹)"
                      stroke="#4F6EF7" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#4F6EF7' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Grid>

          {/* Inventory chart */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 2.5, height: 380 }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="h6" fontWeight={700}>Inventory Levels</Typography>
                <Typography variant="caption" color="text.secondary">Top products by stock quantity</Typography>
              </Box>
              {loading ? (
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
              ) : !data?.inventory_distribution?.length ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                  <ProductsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">No products yet</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.inventory_distribution} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="name"
                      tickFormatter={(s) => s.length > 8 ? `${s.slice(0, 8)}…` : s}
                      stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} tickLine={false} axisLine={false}
                    />
                    <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Bar dataKey="stock" name="Stock" radius={[5, 5, 0, 0]} maxBarSize={40}>
                      {data.inventory_distribution.map((entry, i) => (
                        <Cell key={i} fill={entry.stock <= 10 ? '#F43F5E' : entry.stock <= 20 ? '#F59E0B' : '#4F6EF7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}

export default Dashboard;

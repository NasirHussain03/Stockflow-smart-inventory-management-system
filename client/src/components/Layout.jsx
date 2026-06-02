import React, { useState, createContext, useContext } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
  IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Menu, MenuItem, useTheme, useMediaQuery, Tooltip, alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  People as CustomersIcon,
  ShoppingCart as OrdersIcon,
  Brightness4, Brightness7,
  ExitToApp, KeyboardArrowDown as ArrowDownIcon,
  Person as PersonIcon,
  History as TrackIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

const drawerWidth = 256;

const HeaderActionContext = createContext({ setHeaderAction: () => {} });
export const useHeaderAction = () => useContext(HeaderActionContext);

const NAV_ITEMS = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/',          color: '#4F6EF7', bg: '#EEF2FF' },
  { text: 'Products',  icon: ProductsIcon,  path: '/products',  color: '#10B981', bg: '#ECFDF5' },
  { text: 'Customers', icon: CustomersIcon, path: '/customers', color: '#F59E0B', bg: '#FFFBEB' },
  { text: 'Orders',    icon: OrdersIcon,    path: '/orders',    color: '#8B5CF6', bg: '#F5F3FF' },
  { text: 'Track',     icon: TrackIcon,     path: '/track',     color: '#EC4899', bg: '#FDF2F8' },
];

export function Layout({ children, mode, toggleMode }) {
  const theme = useTheme();
  const isDark = mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [headerAction, setHeaderAction] = useState(null);

  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = NAV_ITEMS.find(i => i.path === location.pathname);
  const userInitial = user?.full_name?.charAt(0).toUpperCase() || 'U';

  const drawerContent = (
    <Box sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      bgcolor: 'background.paper',
    }}>
      {/* Brand */}
      <Box sx={{
        height: 64, display: 'flex', alignItems: 'center',
        px: 2.5, gap: 1.5, flexShrink: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: 2,
          background: 'linear-gradient(135deg, #4F6EF7 0%, #7B93FF 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
          boxShadow: '0 4px 12px rgba(79,110,247,0.35)',
        }}>📦</Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            Stockflow
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Inventory System
          </Typography>
        </Box>
      </Box>

      {/* Nav section label */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.disabled' }}>
          Navigation
        </Typography>
      </Box>

      {/* Nav items */}
      <List sx={{ px: 1.5, py: 1, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: 2,
                  py: 1, px: 1.5,
                  bgcolor: active
                    ? (isDark ? alpha(item.color, 0.15) : alpha(item.color, 0.1))
                    : 'transparent',
                  '&:hover': {
                    bgcolor: active
                      ? (isDark ? alpha(item.color, 0.2) : alpha(item.color, 0.12))
                      : (isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)),
                  },
                  transition: 'background-color 0.15s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Active left bar */}
                {active && (
                  <Box sx={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: '0 3px 3px 0',
                    bgcolor: item.color,
                  }} />
                )}
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box sx={{
                    width: 30, height: 30, borderRadius: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: active ? (isDark ? alpha(item.color, 0.2) : item.bg) : 'transparent',
                    transition: 'background-color 0.15s',
                  }}>
                    <Icon sx={{ fontSize: 17, color: active ? item.color : 'text.secondary' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: active ? 700 : 500,
                    fontSize: 13.5,
                    color: active ? item.color : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* User card */}
      <Box sx={{ p: 1.5 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          p: 1.5, borderRadius: 2,
          bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#4F6EF7', 0.04),
          border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#4F6EF7', 0.08)}`,
        }}>
          <Avatar sx={{
            width: 32, height: 32, fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg, #4F6EF7, #7B93FF)',
            flexShrink: 0,
          }}>
            {userInitial}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700, fontSize: 12.5 }}>
              {user?.full_name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 10.5 }}>
              {user?.email}
            </Typography>
          </Box>
          <Tooltip title="Sign out">
            <IconButton size="small" onClick={handleLogout}
              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: alpha('#F43F5E', 0.1) } }}>
              <ExitToApp sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <HeaderActionContext.Provider value={{ setHeaderAction }}>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

        {/* ── AppBar ── */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.drawer + 1,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 }, gap: 1 }}>
            {/* Mobile hamburger */}
            <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ display: { md: 'none' }, mr: 1 }}>
              <MenuIcon />
            </IconButton>

            {/* Page title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
              {currentPage && (
                <Box sx={{
                  width: 32, height: 32, borderRadius: 1.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: isDark ? alpha(currentPage.color, 0.15) : currentPage.bg,
                }}>
                  {React.createElement(currentPage.icon, { sx: { fontSize: 17, color: currentPage.color } })}
                </Box>
              )}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: 15, sm: 17 }, lineHeight: 1.2 }}>
                  {currentPage?.text || 'Stockflow'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                  {currentPage ? `Manage your ${currentPage.text.toLowerCase()}` : 'Overview'}
                </Typography>
              </Box>
            </Box>

            {/* Right: action slot + theme + profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {headerAction}

              <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
                <IconButton onClick={toggleMode} size="small"
                  sx={{
                    color: 'text.secondary',
                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08) },
                  }}>
                  {isDark ? <Brightness7 sx={{ fontSize: 18 }} /> : <Brightness4 sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>

              {/* Profile pill */}
              <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 1.5, py: 0.75, borderRadius: 2.5, cursor: 'pointer',
                  border: `1.5px solid ${theme.palette.divider}`,
                  bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#4F6EF7', 0.04),
                  '&:hover': {
                    bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#4F6EF7', 0.08),
                    borderColor: '#4F6EF7',
                  },
                  transition: 'all 0.15s',
                  ml: 0.5,
                }}
              >
                <Avatar sx={{
                  width: 24, height: 24, fontSize: 11, fontWeight: 700,
                  background: 'linear-gradient(135deg, #4F6EF7, #7B93FF)',
                }}>
                  {userInitial}
                </Avatar>
                {!isMobile && (
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }} noWrap>
                    {user?.full_name?.split(' ')[0]}
                  </Typography>
                )}
                <ArrowDownIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1, minWidth: 200, borderRadius: 2.5,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: isDark
                        ? '0 8px 32px rgba(0,0,0,0.5)'
                        : '0 8px 32px rgba(79,110,247,0.12)',
                    }
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{
                    width: 36, height: 36, fontSize: 14, fontWeight: 700,
                    background: 'linear-gradient(135deg, #4F6EF7, #7B93FF)',
                  }}>
                    {userInitial}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{user?.full_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                  </Box>
                </Box>
                <Divider />
                <MenuItem
                  onClick={() => { setAnchorEl(null); handleLogout(); }}
                  sx={{ color: 'error.main', gap: 1.5, mx: 1, my: 0.5, borderRadius: 1.5 }}
                >
                  <ExitToApp fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>Sign Out</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* ── Sidebar ── */}
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 'none' } }}>
            {drawerContent}
          </Drawer>
          <Drawer variant="permanent" open
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                borderRight: `1px solid ${theme.palette.divider}`,
                boxShadow: isDark ? 'none' : '2px 0 12px rgba(79,110,247,0.06)',
              }
            }}>
            {drawerContent}
          </Drawer>
        </Box>

        {/* ── Main content ── */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            bgcolor: 'background.default',
            minHeight: '100vh',
            overflowY: 'auto',
            pt: '64px',
          }}
        >
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {children}
          </Box>
        </Box>
      </Box>
    </HeaderActionContext.Provider>
  );
}

export default Layout;

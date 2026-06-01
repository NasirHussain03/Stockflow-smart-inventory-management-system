import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  IconButton, InputAdornment, Alert, useTheme, Stack, Divider, alpha
} from '@mui/material';
import {
  Visibility, VisibilityOff, LockOutlined, MailOutline,
  Brightness4, Brightness7, PersonOutline,
  Inventory as InventoryIcon, TrendingUp, Security, Speed
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { authApi } from '../services/api';
import { useAuth, useNotification } from '../App';

const FEATURES = [
  { 
    icon: InventoryIcon, 
    title: 'Real-Time Tracking', 
    description: 'Instantly monitor stock levels and warehouses.' 
  },
  { 
    icon: TrendingUp, 
    title: 'Analytics & Insights', 
    description: 'Track monthly revenue and inventory charts.' 
  },
  { 
    icon: Security, 
    title: 'Secure Workspace', 
    description: 'Keep your data private and fully scoped.' 
  },
  { 
    icon: Speed, 
    title: 'High Performance', 
    description: 'Responsive layout with zero-latency updates.' 
  },
];

export function Login({ mode, toggleMode }) {
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isDark = mode === 'dark';

  const { handleLogin } = useAuth();
  const { showNotification } = useNotification();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const handleModeToggle = () => {
    setAuthMode(p => p === 'login' ? 'signup' : 'login');
    setAuthError('');
    reset();
  };

  const fillDemoCredentials = () => {
    setValue('email', 'admin@stockflow.com');
    setValue('password', 'password123');
  };

  const onSubmit = async (data) => {
    setAuthError('');
    setLoading(true);
    try {
      if (authMode === 'login') {
        const response = await authApi.login({ email: data.email, password: data.password });
        handleLogin(response);
      } else {
        await authApi.signup({ full_name: data.full_name, email: data.email, password: data.password, role: 'Staff' });
        showNotification('Account created! Please sign in.', 'success');
        setAuthMode('login');
        reset();
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      bgcolor: 'background.default',
      position: 'relative',
      overflow: 'hidden',
      '@keyframes floatOrb': {
        '0%': { transform: 'translate(0, 0) scale(1)' },
        '100%': { transform: 'translate(50px, 40px) scale(1.15)' }
      },
      '@keyframes floatOrb2': {
        '0%': { transform: 'translate(0, 0) scale(1)' },
        '100%': { transform: 'translate(-40px, -50px) scale(1.1)' }
      }
    }}>
      {/* Glowing background mesh orbs */}
      <Box sx={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '45vw', height: '45vw', borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(79,110,247,0.2) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(79,110,247,0.12) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none',
        animation: 'floatOrb 15s infinite alternate ease-in-out',
        zIndex: 1
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 75%)'
          : 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 75%)',
        filter: 'blur(80px)', pointerEvents: 'none',
        animation: 'floatOrb2 18s infinite alternate-reverse ease-in-out',
        zIndex: 1
      }} />

      {/* Background decoration */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: isDark
          ? 'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(79,110,247,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(139,92,246,0.05) 0%, transparent 60%)'
          : 'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(79,110,247,0.05) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(139,92,246,0.04) 0%, transparent 60%)',
        zIndex: 2
      }} />

      {/* Theme toggle */}
      <IconButton onClick={toggleMode} sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        {isDark ? <Brightness7 /> : <Brightness4 />}
      </IconButton>

      {/* Left panel — branding (desktop only) */}
      <Box sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        width: '45%',
        px: 8,
        position: 'relative',
        zIndex: 5
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2.5,
            background: 'linear-gradient(135deg, #4F6EF7 0%, #7B93FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 8px 24px rgba(79,110,247,0.35)',
          }}>📦</Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Stockflow</Typography>
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, mb: 2 }}>
          Manage your inventory{' '}
          <Box component="span" sx={{
            background: 'linear-gradient(135deg, #4F6EF7, #8B5CF6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            smarter.
          </Box>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 5, lineHeight: 1.7, maxWidth: 380 }}>
          Track products, manage customers, process orders — all in one place. Your data stays private and scoped to your account.
        </Typography>

        <Stack spacing={2.5}>
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Box 
              key={title} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2.5,
                p: 2.5,
                borderRadius: 4,
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.25)' : 'rgba(255, 255, 255, 0.45)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(79, 110, 247, 0.08)'}`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateX(8px) scale(1.01)',
                  bgcolor: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: alpha('#4F6EF7', 0.4),
                  boxShadow: isDark 
                    ? '0 12px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(79,110,247,0.05)'
                    : '0 12px 30px rgba(79,110,247,0.06)',
                  '& .feature-icon': {
                    transform: 'scale(1.1)',
                    background: 'linear-gradient(135deg, #4F6EF7 0%, #8B5CF6 100%)',
                    color: '#ffffff',
                  }
                }
              }}
            >
              <Box 
                className="feature-icon"
                sx={{
                  width: 48, height: 48, borderRadius: 3,
                  bgcolor: isDark ? alpha('#4F6EF7', 0.15) : alpha('#4F6EF7', 0.08),
                  color: '#4F6EF7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  flexShrink: 0
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.primary" fontWeight={700} sx={{ mb: 0.5 }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                  {description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Right panel — form */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
        position: 'relative',
        zIndex: 5
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 5,
          p: '2px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(79,110,247,0.6) 0%, rgba(139,92,246,0.6) 100%)'
            : 'linear-gradient(135deg, rgba(79,110,247,0.4) 0%, rgba(139,92,246,0.4) 100%)',
          boxShadow: isDark
            ? '0 20px 50px rgba(0,0,0,0.4)'
            : '0 20px 50px rgba(79,110,247,0.08)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4F6EF7 0%, #8B5CF6 100%)',
            boxShadow: isDark
              ? '0 30px 70px rgba(79,110,247,0.2), 0 0 30px rgba(139,92,246,0.2)'
              : '0 30px 70px rgba(79,110,247,0.16), 0 0 30px rgba(139,92,246,0.1)',
            transform: 'translateY(-4px)'
          }
        }}>
          <Card sx={{
            width: '100%',
            height: '100%',
            borderRadius: '18px',
            backdropFilter: 'blur(20px)',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            border: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Mobile logo */}
              <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: 2,
                  background: 'linear-gradient(135deg, #4F6EF7, #7B93FF)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>📦</Box>
                <Typography variant="h6" fontWeight={800}>Stockflow</Typography>
              </Box>

              {/* Segmented Pill Switcher */}
              <Box sx={{
                display: 'flex',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(0, 0, 0, 0.04)',
                p: 0.5,
                borderRadius: '100px',
                mb: 3,
                position: 'relative',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: 4,
                  bottom: 4,
                  left: authMode === 'login' ? '4px' : 'calc(50% + 2px)',
                  width: 'calc(50% - 6px)',
                  borderRadius: '100px',
                  background: 'linear-gradient(135deg, #4F6EF7, #8B5CF6)',
                  boxShadow: '0 4px 12px rgba(79,110,247,0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 1
                }} />
                <Button
                  onClick={() => { setAuthMode('login'); setAuthError(''); reset(); }}
                  sx={{
                    flex: 1,
                    borderRadius: '100px',
                    py: 1,
                    zIndex: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    color: authMode === 'login' ? '#ffffff' : (isDark ? 'text.secondary' : 'text.primary'),
                    transition: 'color 0.3s',
                    minWidth: 0,
                    '&:hover': { bgcolor: 'transparent' }
                  }}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => { setAuthMode('signup'); setAuthError(''); reset(); }}
                  sx={{
                    flex: 1,
                    borderRadius: '100px',
                    py: 1,
                    zIndex: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    color: authMode === 'signup' ? '#ffffff' : (isDark ? 'text.secondary' : 'text.primary'),
                    transition: 'color 0.3s',
                    minWidth: 0,
                    '&:hover': { bgcolor: 'transparent' }
                  }}
                >
                  Sign Up
                </Button>
              </Box>

              {/* Animated form container */}
              <Box
                key={authMode}
                sx={{
                  animation: 'slideUpFade 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                  '@keyframes slideUpFade': {
                    '0%': { opacity: 0, transform: 'translateY(15px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                  {authMode === 'login' ? 'Welcome back' : 'Create account'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {authMode === 'login'
                    ? 'Sign in to access your workspace'
                    : 'Start managing your inventory today'}
                </Typography>

                {authError && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{authError}</Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={2}>
                    {authMode === 'signup' && (
                      <TextField fullWidth label="Full Name" placeholder="Jane Smith"
                        {...register('full_name', { required: 'Full name is required' })}
                        error={!!errors.full_name} helperText={errors.full_name?.message}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><PersonOutline fontSize="small" color="action" /></InputAdornment>,
                          sx: {
                            borderRadius: 2.5,
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                            '& input:-webkit-autofill': {
                              WebkitBoxShadow: isDark ? '0 0 0 100px #0f172a inset' : '0 0 0 100px #ffffff inset',
                              WebkitTextFillColor: isDark ? '#ffffff' : '#000000',
                              borderRadius: 'inherit',
                            }
                          }
                        }}
                      />
                    )}
                    <TextField fullWidth label="Email Address" placeholder="you@example.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                      })}
                      error={!!errors.email} helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><MailOutline fontSize="small" color="action" /></InputAdornment>,
                        sx: {
                          borderRadius: 2.5,
                          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                          '& input:-webkit-autofill': {
                            WebkitBoxShadow: isDark ? '0 0 0 100px #0f172a inset' : '0 0 0 100px #ffffff inset',
                            WebkitTextFillColor: isDark ? '#ffffff' : '#000000',
                            borderRadius: 'inherit',
                          }
                        }
                      }}
                    />
                    <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'At least 6 characters' }
                      })}
                      error={!!errors.password} helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" color="action" /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 2.5,
                          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                          '& input:-webkit-autofill': {
                            WebkitBoxShadow: isDark ? '0 0 0 100px #0f172a inset' : '0 0 0 100px #ffffff inset',
                            WebkitTextFillColor: isDark ? '#ffffff' : '#000000',
                            borderRadius: 'inherit',
                          }
                        }
                      }}
                    />
                  </Stack>

                  <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
                    sx={{
                      mt: 3, mb: 1.5, py: 1.4, borderRadius: 2.5, fontWeight: 700, fontSize: 15,
                      background: 'linear-gradient(135deg, #4F6EF7 0%, #8B5CF6 100%)',
                      boxShadow: '0 4px 14px rgba(79,110,247,0.4)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5F7EFF 0%, #9B6CFF 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 20px rgba(79,110,247,0.6)',
                      },
                      '&:active': {
                        transform: 'translateY(1px)',
                      }
                    }}>
                    {loading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </Button>

                  <Divider sx={{ my: 1.5 }}>
                    <Typography variant="caption" color="text.disabled">or</Typography>
                  </Divider>

                  <Button fullWidth variant="text" size="small" onClick={handleModeToggle}
                    sx={{ color: 'text.secondary', fontWeight: 600, '&:hover': { color: '#4F6EF7' }, transition: 'color 0.2s' }}>
                    {authMode === 'login'
                      ? "Don't have an account? Sign up"
                      : 'Already have an account? Sign in'}
                  </Button>
                </form>

                {authMode === 'login' && (
                  <Box
                    onClick={fillDemoCredentials}
                    sx={{
                      mt: 2.5, p: 2, borderRadius: 3, textAlign: 'center',
                      backgroundColor: isDark ? 'rgba(79,110,247,0.06)' : 'rgba(79,110,247,0.03)',
                      border: `1px dashed ${isDark ? 'rgba(79,110,247,0.25)' : 'rgba(79,110,247,0.18)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: isDark ? 'rgba(79,110,247,0.12)' : 'rgba(79,110,247,0.07)',
                        borderColor: '#4F6EF7',
                        transform: 'translateY(-2px)',
                        boxShadow: isDark ? '0 8px 24px rgba(79,110,247,0.1)' : '0 8px 24px rgba(79,110,247,0.05)'
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      }
                    }}
                  >
                    <Typography variant="caption" color="primary" display="block" fontWeight={700} sx={{ mb: 0.5, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Demo credentials (Click to autofill)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      admin@stockflow.com · password123
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;

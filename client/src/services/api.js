import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const apiBase = `${API_URL}/api`;

const apiClient = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
});

// Attach X-User-Id (and X-User-Role for legacy compat) on every request
apiClient.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user_profile');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.id)   config.headers['X-User-Id']   = String(user.id);
        if (user?.role) config.headers['X-User-Role'] = user.role;
      } catch (e) {
        console.error('Error parsing user profile', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalise error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred.';
    if (error.response) {
      const d = error.response.data;
      if (d?.detail)       message = typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail);
      else if (d?.message) message = d.message;
      else if (error.response.status === 403) message = 'Forbidden: you do not have permission.';
      else if (error.response.status === 404) message = 'The requested resource was not found.';
    } else if (error.request) {
      message = 'Failed to connect to the server. Please verify the API is running.';
    }
    return Promise.reject({ originalError: error, message, status: error.response?.status });
  }
);

export const authApi = {
  signup: (data) => apiClient.post('/auth/signup', data).then(r => r.data),
  login:  (data) => apiClient.post('/auth/login',  data).then(r => r.data),
};

export const productApi = {
  getAll:  (params) => apiClient.get('/products/',      { params }).then(r => r.data),
  getById: (id)     => apiClient.get(`/products/${id}`).then(r => r.data),
  create:  (data)   => apiClient.post('/products/', data).then(r => r.data),
  update:  (id, data) => apiClient.put(`/products/${id}`, data).then(r => r.data),
  delete:  (id)     => apiClient.delete(`/products/${id}`).then(r => r.data),
};

export const customerApi = {
  getAll:  (params) => apiClient.get('/customers/',      { params }).then(r => r.data),
  getById: (id)     => apiClient.get(`/customers/${id}`).then(r => r.data),
  create:  (data)   => apiClient.post('/customers/', data).then(r => r.data),
  update:  (id, data) => apiClient.put(`/customers/${id}`, data).then(r => r.data),
  delete:  (id)     => apiClient.delete(`/customers/${id}`).then(r => r.data),
};

export const orderApi = {
  getAll:       (params)       => apiClient.get('/orders/',      { params }).then(r => r.data),
  getById:      (id)           => apiClient.get(`/orders/${id}`).then(r => r.data),
  create:       (data)         => apiClient.post('/orders/', data).then(r => r.data),
  updateStatus: (id, status)   => apiClient.put(`/orders/${id}`, { status }).then(r => r.data),
  delete:       (id)           => apiClient.delete(`/orders/${id}`).then(r => r.data),
};

export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats').then(r => r.data),
};

export const activityLogApi = {
  getAll: (params) => apiClient.get('/activity-logs/', { params }).then(r => r.data),
};

export default apiClient;

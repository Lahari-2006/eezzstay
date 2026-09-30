import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ezeestayy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on auth error if expired
      // localStorage.removeItem('ezeestayy_token');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  getDemoStatus: () => api.get('/auth/demo-status'),
  demoLogin: (role) => api.post('/auth/demo-login', { role }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  linkParent: (studentLinkCode) => api.post('/auth/link-parent', { student_link_code: studentLinkCode }),
};

export const hostelApi = {
  list: (params) => api.get('/hostels', { params }),
  getById: (id) => api.get(`/hostels/${id}`),
  create: (data) => api.post('/hostels', data),
  update: (id, data) => api.put(`/hostels/${id}`, data),
  uploadDocument: (id, data) => api.post(`/hostels/${id}/documents`, null, { params: data }),
};

export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getOwnerRequests: () => api.get('/bookings/owner-requests'),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
};

export const logisticsApi = {
  getQuote: (data) => api.post('/logistics/quote', data),
  createOrder: (data) => api.post('/logistics/orders', data),
  getMyOrders: () => api.get('/logistics/my-orders'),
  track: (trackingNumber) => api.get(`/logistics/track/${trackingNumber}`),
};

export const essentialsApi = {
  getBundles: () => api.get('/essentials/bundles'),
  getItems: (category) => api.get('/essentials/items', { params: { category } }),
  createOrder: (data) => api.post('/essentials/orders', data),
  getMyOrders: () => api.get('/essentials/my-orders'),
};

export const journeyApi = {
  getMyJourney: () => api.get('/journeys/my-journey'),
  getAlerts: () => api.get('/journeys/alerts'),
};

export const universityApi = {
  list: (city) => api.get('/universities', { params: { city } }),
  getBySlug: (slug) => api.get(`/universities/${slug}`),
};

export const adminApi = {
  getKPIs: () => api.get('/admin/kpis'),
  getRiskBoard: (tier) => api.get('/admin/risk-board', { params: { tier } }),
  getVerificationQueue: () => api.get('/admin/verification-queue'),
  verifyHostel: (hostelId, data) => api.put(`/admin/hostels/${hostelId}/verify`, data),
  sendAlert: (studentId, data) => api.post(`/admin/journeys/${studentId}/intervention-alert`, data),
  getUsers: (role) => api.get('/admin/users', { params: { role } }),
};

export const reviewApi = {
  getByHostel: (hostelId) => api.get(`/reviews/hostel/${hostelId}`),
  create: (data) => api.post('/reviews', data),
};

export default api;

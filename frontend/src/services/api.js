import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medibook_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth Services
export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Doctors Services
export const doctorService = {
  getDoctors: async (params = {}) => {
    const res = await api.get('/doctors', { params });
    return res.data;
  },
  getDoctorById: async (id) => {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },
  getDoctorSlots: async (id, date) => {
    const res = await api.get(`/doctors/${id}/slots`, { params: { date } });
    return res.data;
  },
};

// Appointments Services
export const appointmentService = {
  bookAppointment: async (bookingData) => {
    const res = await api.post('/appointments', bookingData);
    return res.data;
  },
  getMyAppointments: async () => {
    const res = await api.get('/appointments/my');
    return res.data;
  },
  getAppointmentById: async (id) => {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },
  cancelAppointment: async (id, reason) => {
    const res = await api.patch(`/appointments/${id}/cancel`, { reason });
    return res.data;
  },
};

// Doctor Dashboard Services
export const doctorDashboardService = {
  getOverview: async () => {
    const res = await api.get('/doctor-dashboard/overview');
    return res.data;
  },
  getAppointments: async (params = {}) => {
    const res = await api.get('/doctor-dashboard/appointments', { params });
    return res.data;
  },
  updateAppointmentStatus: async (id, statusData) => {
    const res = await api.patch(`/doctor-dashboard/appointments/${id}/status`, statusData);
    return res.data;
  },
  callNextPatient: async () => {
    const res = await api.post('/doctor-dashboard/queue/call-next');
    return res.data;
  },
  updateSettings: async (settings) => {
    const res = await api.patch('/doctor-dashboard/settings', settings);
    return res.data;
  },
};

export default api;

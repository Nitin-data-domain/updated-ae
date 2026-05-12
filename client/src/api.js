import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aharada_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aharada_token');
      localStorage.removeItem('aharada_user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginAdmin = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Programs
export const getPrograms = () => api.get('/programs');
export const getProgram = (slug) => api.get(`/programs/${slug}`);
export const getProgramBySlug = (slug) => api.get(`/programs/${slug}`);
export const createProgram = (data) => api.post('/programs', data);
export const updateProgram = (id, data) => api.put(`/programs/${id}`, data);
export const deleteProgram = (id) => api.delete(`/programs/${id}`);
export const uploadProgramImage = (formData) =>
  api.post('/programs/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const fetchProgramImage = (url) =>
  api.post('/programs/fetch-image', { url });

// Faculty
export const getFaculty = () => api.get('/faculty');
export const createFaculty = (data) => api.post('/faculty', data);
export const updateFaculty = (id, data) => api.put(`/faculty/${id}`, data);
export const deleteFaculty = (id) => api.delete(`/faculty/${id}`);
export const uploadFacultyImage = (formData) =>
  api.post('/faculty/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const fetchFacultyImage = (url) =>
  api.post('/faculty/fetch-image', { url });

// Events
export const getEvents = () => api.get('/events');
export const createEvent = (data) => api.post('/events', data);
export const uploadEventImage = (formData) =>
  api.post('/events/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const fetchEventImage = (url) => api.post('/events/fetch-image', { url });
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);

// Enquiries
export const submitEnquiry = (data) => api.post('/enquiries', data);
export const getEnquiries = (params) => api.get('/enquiries', { params });
export const getAdmissionLeads = (params) => api.get('/enquiries', { params: { ...params, type: 'admission_lead' } });
export const getContactEnquiries = (params) => api.get('/enquiries', { params: { ...params, type: 'enquiry' } });
export const getEnquiryStats = (type) => api.get('/enquiries/stats', { params: type ? { type } : {} });
export const updateEnquiry = (id, data) => api.put(`/enquiries/${id}`, data);
export const deleteEnquiry = (id) => api.delete(`/enquiries/${id}`);

// Brochures
export const getBrochures = (params) => api.get('/brochures', { params });
export const uploadBrochure = (formData) =>
  api.post('/brochures', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getAllBrochures = () => api.get('/brochures/admin');
export const updateBrochure = (id, data) => api.put(`/brochures/${id}`, data);
export const deleteBrochure = (id) => api.delete(`/brochures/${id}`);
export const downloadBrochure = (id) => `${API_BASE}/api/brochures/download/${id}`;

// Placements
export const getPlacements = (page = 1, limit = 15) => api.get('/placements', { params: { page, limit } });
export const getAllPlacementsAdmin = () => api.get('/placements/admin');
export const getPlacement = (id) => api.get(`/placements/${id}`);
export const createPlacement = (data) => api.post('/placements', data);
export const updatePlacement = (id, data) => api.put(`/placements/${id}`, data);
export const deletePlacement = (id) => api.delete(`/placements/${id}`);
export const uploadPlacementImage = (formData) =>
  api.post('/placements/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const fetchPlacementImage = (url) => api.post('/placements/fetch-image', { url });

export default api;

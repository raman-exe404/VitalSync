import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

export const saveHealthLog = (data) => api.post('/api/health-log', data);
export const getHealthLogs = (user_id) => api.get('/api/health-logs', { params: { user_id } });
export const getAlerts = (user_id) => api.get('/api/alerts', { params: { user_id } });
export const markAlertRead = (id) => api.patch(`/api/alerts/${id}/read`);
export const sendSOS = (data) => api.post('/api/send-sos', data);
export const getNearbyHospitals = (lat, lng) => api.get('/api/nearby-hospitals', { params: { lat, lng } });
export const sendChat = (message) => api.post('/api/chat', { message });
export const getWeather = (lat, lng) => api.get('/api/weather', { params: { lat, lng } });

export default api;

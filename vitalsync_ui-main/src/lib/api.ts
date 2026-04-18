import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export const saveHealthLog = (data: object) => api.post('/api/health-log', data);
export const getHealthLogs = (user_id: string) => api.get('/api/health-logs', { params: { user_id } });
export const getAlerts = (user_id: string) => api.get('/api/alerts', { params: { user_id } });
export const markAlertRead = (id: string) => api.patch(`/api/alerts/${id}/read`);
export const sendSOS = (data: object) => api.post('/api/send-sos', data);
export const getNearbyHospitals = (lat: number, lng: number) => api.get('/api/nearby-hospitals', { params: { lat, lng } });
export const sendChat = (message: string) => api.post('/api/chat', { message });
export const getWeather = (lat: number, lng: number) => api.get('/api/weather', { params: { lat, lng } });

export const sendOTP = (phone: string) => api.post('/api/otp/send', { phone });
export const verifyOTP = (phone: string, otp: string) => api.post('/api/otp/verify', { phone, otp });

export default api;

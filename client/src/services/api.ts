import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Participant {
  id?: string;
  name: string;
  email: string;
  mobile: string;
  indexNumber: string;
  qrCode?: string;
  attended?: boolean;
  emailSent?: boolean;
  createdAt?: string;
}

// API functions
export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    return api.post('/login', credentials);
  },
};

export const participantAPI = {
  getAll: async () => {
    return api.get('/dashboard/participants');
  },

  create: async (participant: Omit<Participant, 'id' | 'qrCode' | 'attended' | 'createdAt'>) => {
    return api.post('/add-participant', participant);
  },

  delete: async (id: string) => {
    return api.delete(`/dashboard/participants/${id}`);
  },

  sendEmail: async (id: string) => {
    return api.post(`/dashboard/send-email/${id}`);
  },

  markAttendance: async (qrCode: string) => {
    return api.post('/dashboard/mark-attendance', { qrCode });
  },
};

export const ticketAPI = {
  upload: async (formData: FormData) => {
    return api.post('/dashboard/upload-pre-designed-ticket', formData);
  },
};

export default api;

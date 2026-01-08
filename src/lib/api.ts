import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Normalize image URL to use full backend URL
 */
export function normalizeImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  
  // If already a full URL (http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a data URL (base64), return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If it's a relative path, prepend API_URL
  if (imageUrl.startsWith('/')) {
    return `${API_URL}${imageUrl}`;
  }
  
  // Otherwise, assume it's a relative path and prepend API_URL
  return `${API_URL}/${imageUrl}`;
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with automatic token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${API_URL}/api/v1/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken, user } = response.data;
        useAuthStore.getState().setTokens(accessToken, newRefreshToken || refreshToken);
        if (user) {
          useAuthStore.getState().setUser(user);
        }

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN' | 'EDITOR';
  linkedinProfile?: {
    linkedinId: string;
    profileUrl: string | null;
    headline: string | null;
    tokenExpiresAt: string;
  };
}

export interface Content {
  id: string;
  theme: string;
  outline: string | null;
  rawContent: string | null;
  finalContent: string | null;
  imageUrl: string | null;
  imagePrompt: string | null;
  persona: 'GENERAL' | 'TECH' | 'FOUNDER' | 'RECRUITER';
  status: 'DRAFT' | 'GENERATING' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  version: number;
  createdAt: string;
  updatedAt: string;
  schedule?: Schedule;
  analytics?: Analytics;
}

export interface Schedule {
  id: string;
  scheduledAt: string;
  publishedAt: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

export interface Analytics {
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagement: number;
}

export interface Job {
  id: string;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  createdAt: string;
}

// API Methods
export const authApi = {
  getProfile: () => api.get<User>('/auth/me'),
  refreshToken: (refreshToken: string) =>
    axios.post(`${API_URL}/api/v1/auth/refresh`, { refreshToken }),
  logout: (refreshToken?: string) => api.post('/auth/logout', { refreshToken }),
};

export const contentApi = {
  create: (data: { theme: string; persona?: string }) =>
    api.post<Content>('/content', data),
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<{ items: Content[]; total: number; page: number; totalPages: number }>(
      '/content',
      { params }
    ),
  getOne: (id: string) => api.get<Content>(`/content/${id}`),
  update: (id: string, data: Partial<Content>) =>
    api.put<Content>(`/content/${id}`, data),
  delete: (id: string) => api.delete(`/content/${id}`),
  getDashboard: () =>
    api.get<{
      stats: { total: number; published: number; scheduled: number; draft: number };
      recentContents: Content[];
    }>('/content/dashboard'),
};

export const jobsApi = {
  startGeneration: (data: { contentId: string; theme: string; persona?: string }) =>
    api.post<Job>('/jobs/generate', data),
  getByContent: (contentId: string) => api.get<Job[]>(`/jobs/content/${contentId}`),
};

export const schedulerApi = {
  schedule: (data: { contentId: string; scheduledAt: string }) =>
    api.post<Schedule>('/scheduler', data),
  getAll: (params?: { upcoming?: boolean }) =>
    api.get<Schedule[]>('/scheduler', { params }),
  cancel: (id: string) => api.delete(`/scheduler/${id}`),
  getCalendar: (year: number, month: number) =>
    api.get(`/scheduler/calendar`, { params: { year, month } }),
};

export const analyticsApi = {
  getOverview: () => api.get('/analytics'),
  getTopPosts: (limit?: number) => api.get('/analytics/top', { params: { limit } }),
  getByPeriod: (days: number) => api.get('/analytics/period', { params: { days } }),
  getByPersona: () => api.get('/analytics/personas'),
};

export const linkedinApi = {
  getProfile: () => api.get('/linkedin/profile'),
};

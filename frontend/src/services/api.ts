import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3002/api',
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // User endpoints
  async getUsers(params?: { role?: string; active?: boolean }): Promise<ApiResponse> {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getWorkers(): Promise<ApiResponse> {
    const response = await this.api.get('/users/workers');
    return response.data;
  }

  async getUser(id: number): Promise<ApiResponse> {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: any): Promise<ApiResponse> {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: number, userData: any): Promise<ApiResponse> {
    const response = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // Client endpoints
  async getClients(params?: { active?: boolean; search?: string }): Promise<ApiResponse> {
    const response = await this.api.get('/clients', { params });
    return response.data;
  }

  async getClient(id: number): Promise<ApiResponse> {
    const response = await this.api.get(`/clients/${id}`);
    return response.data;
  }

  async createClient(clientData: any): Promise<ApiResponse> {
    const response = await this.api.post('/clients', clientData);
    return response.data;
  }

  async updateClient(id: number, clientData: any): Promise<ApiResponse> {
    const response = await this.api.put(`/clients/${id}`, clientData);
    return response.data;
  }

  async deleteClient(id: number): Promise<ApiResponse> {
    const response = await this.api.delete(`/clients/${id}`);
    return response.data;
  }

  // Job endpoints
  async getJobs(params?: { status?: string; date?: string; workerId?: number }): Promise<ApiResponse> {
    const response = await this.api.get('/jobs', { params });
    return response.data;
  }

  async getJob(id: number): Promise<ApiResponse> {
    const response = await this.api.get(`/jobs/${id}`);
    return response.data;
  }

  async createJob(jobData: any): Promise<ApiResponse> {
    const response = await this.api.post('/jobs', jobData);
    return response.data;
  }

  async updateJob(id: number, jobData: any): Promise<ApiResponse> {
    const response = await this.api.put(`/jobs/${id}`, jobData);
    return response.data;
  }

  async deleteJob(id: number): Promise<ApiResponse> {
    const response = await this.api.delete(`/jobs/${id}`);
    return response.data;
  }

  // Location endpoints
  async getJobLocationHistory(jobId: number): Promise<ApiResponse> {
    const response = await this.api.get(`/location/job/${jobId}`);
    return response.data;
  }

  async getWorkerLocation(workerId: number): Promise<ApiResponse> {
    const response = await this.api.get(`/location/worker/${workerId}`);
    return response.data;
  }

  // Note endpoints
  async getJobNotes(jobId: number): Promise<ApiResponse> {
    const response = await this.api.get(`/notes/job/${jobId}`);
    return response.data;
  }

  async getNote(id: number): Promise<ApiResponse> {
    const response = await this.api.get(`/notes/${id}`);
    return response.data;
  }

  async createNote(noteData: any): Promise<ApiResponse> {
    const response = await this.api.post('/notes', noteData);
    return response.data;
  }

  async updateNote(id: number, noteData: any): Promise<ApiResponse> {
    const response = await this.api.put(`/notes/${id}`, noteData);
    return response.data;
  }

  async deleteNote(id: number): Promise<ApiResponse> {
    const response = await this.api.delete(`/notes/${id}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;

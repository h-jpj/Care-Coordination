import axios from 'axios'

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://192.168.0.103:3003',
      timeout: 10000,
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.api.post('/auth/login', { email, password })
    return response.data
  }

  async logout() {
    const response = await this.api.post('/auth/logout')
    return response.data
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me')
    return response.data
  }

  // User endpoints
  async getUsers(params = {}) {
    const response = await this.api.get('/users', { params })
    return response.data
  }

  async getWorkers() {
    const response = await this.api.get('/users')
    return response.data
  }

  // Job endpoints
  async getJobs(params = {}) {
    const response = await this.api.get('/jobs', { params })
    return response.data
  }

  async getJob(id) {
    const response = await this.api.get(`/jobs/${id}`)
    return response.data
  }

  async createJob(jobData) {
    const response = await this.api.post('/jobs', jobData)
    return response.data
  }

  async updateJob(id, jobData) {
    const response = await this.api.put(`/jobs/${id}`, jobData)
    return response.data
  }

  async updateJobStatus(id, status, notes = '') {
    const response = await this.api.put(`/jobs/${id}/status`, { status, notes })
    return response.data
  }

  // Client endpoints
  async getClients(params = {}) {
    const response = await this.api.get('/clients', { params })
    return response.data
  }

  // Notes endpoints
  async getNotes(params = {}) {
    const response = await this.api.get('/notes', { params })
    return response.data
  }

  async getJobNotes(jobId) {
    const response = await this.api.get('/notes', { params: { job_id: jobId } })
    return response.data
  }

  async createNote(noteData) {
    const response = await this.api.post('/notes', noteData)
    return response.data
  }

  // Alert endpoints
  async getAlerts(params = {}) {
    const response = await this.api.get('/alerts', { params })
    return response.data
  }

  // Incident endpoints
  async getIncidents(params = {}) {
    const response = await this.api.get('/incidents', { params })
    return response.data
  }

  // Care plan endpoints
  async getCarePlans(params = {}) {
    const response = await this.api.get('/care-plans', { params })
    return response.data
  }

  // Dashboard endpoints
  async getDashboardSummary() {
    const response = await this.api.get('/dashboard/summary')
    return response.data
  }
}

export const apiService = new ApiService()
export default apiService

// Simple API object for new components
export const api = {
  get: (url) => apiService.api.get(url),
  post: (url, data) => apiService.api.post(url, data),
  put: (url, data) => apiService.api.put(url, data),
  delete: (url) => apiService.api.delete(url)
}

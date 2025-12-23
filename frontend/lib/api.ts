import axios, { AxiosError } from 'axios'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  CloudAccount,
  CreateAccountData,
  Resource,
  ScanTask,
  ConnectionTestResponse,
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // FastAPI OAuth2PasswordRequestForm expects form data with 'username' field
    const formData = new URLSearchParams()
    formData.append('username', credentials.email)
    formData.append('password', credentials.password)

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  register: async (data: RegisterData): Promise<{ message: string; data: User }> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },
}

export const userAPI = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/user/get_user')
    return response.data
  },
}

export const accountAPI = {
  createAccount: async (data: CreateAccountData): Promise<{ message: string; data: CloudAccount }> => {
    const response = await api.post('/account/', data)
    return response.data
  },

  deleteAccount: async (accountId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/account/${accountId}`)
    return response.data
  },

  listAccounts: async (): Promise<{ message: string; data: CloudAccount[] }> => {
    const response = await api.get('/account/')
    return response.data
  },

  getAccountResources: async (accountId: string): Promise<{ message: string; data: Resource[] }> => {
    const response = await api.get(`/account/${accountId}/resources`)
    return response.data
  },

  testConnection: async (accountId: string): Promise<{ message: string; data: ConnectionTestResponse }> => {
    const response = await api.get(`/account/${accountId}/test_connection`)
    return response.data
  },
}

export const scanAPI = {
  startScan: async (accountId: string, region: string): Promise<{ message: string; data: { task_id: string } }> => {
    const response = await api.post(`/scan/${accountId}/scan-${region}`)
    return response.data
  },

  getTaskStatus: async (taskId: string): Promise<{ message: string; data: ScanTask }> => {
    const response = await api.get(`/scan/task/${taskId}`)
    return response.data
  },
}

export default api

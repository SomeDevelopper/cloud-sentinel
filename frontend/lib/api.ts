import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.removeToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

export const apiClient = new ApiClient();

export interface StandardResponse<T = unknown> {
  message: string;
  data?: T;
}

export interface UserCreate {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  entreprise: string;
}

export interface User {
  email: string;
  firstname: string;
  lastname: string;
  entreprise: string;
  is_active: boolean;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CloudAccountCreate {
  account_name: string;
  provider: 'AWS' | 'AZURE' | 'GCP';
  access_key_public: string;
  secret_key: string;
  tenant_id?: string;
}

export interface CloudAccount {
  id: string;
  account_name: string;
  provider: string;
  access_key_public: string;
  tenant_id?: string;
  created_at: string;
}

export interface CloudResource {
  id: string;
  cloud_account_id: string;
  resource_type: string;
  resource_id: string;
  region: string;
  detail: Record<string, unknown>;
}

export const authApi = {
  register: (data: UserCreate) =>
    apiClient.post<StandardResponse>('/auth/register', data),

  login: async (data: UserLogin): Promise<TokenResponse> => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);

    return apiClient.post<TokenResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const accountApi = {
  getAccounts: () =>
    apiClient.get<StandardResponse<CloudAccount[]>>('/account/'),

  createAccount: (data: CloudAccountCreate) =>
    apiClient.post<StandardResponse<CloudAccount>>('/account/', data),

  deleteAccount: (accountId: string) =>
    apiClient.delete<StandardResponse>(`/account/${accountId}`),

  getResources: (accountId: string) =>
    apiClient.get<StandardResponse<CloudResource[]>>(`/account/${accountId}/resources`),

  testConnection: (accountId: string) =>
    apiClient.get<StandardResponse>(`/account/${accountId}/test_connection`),
};

export interface TaskStatus {
  task_id: string;
  state: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';
  result?: string;
}

export const scanApi = {
  scanAccount: (accountId: string, region: string) =>
    apiClient.post<StandardResponse<{ task_id: string }>>(`/scan/${accountId}/scan-${region}`),

  getTaskStatus: (taskId: string) =>
    apiClient.get<StandardResponse<TaskStatus>>(`/scan/task/${taskId}`),
};

export const userApi = {
  getCurrentUser: () =>
    apiClient.get<User>('/user/get_user'),
};

export interface User {
  user_id: string
  email: string
  firstname: string
  lastname: string
  entreprise: string
  is_active: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstname: string
  lastname: string
  entreprise: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface CloudAccount {
  id: string
  account_name: string
  provider: 'AWS' | 'AZURE' | 'GCP'
  access_key_public: string
  tenant_id?: string
  created_at: string
}

export interface CreateAccountData {
  account_name: string
  provider: 'AWS' | 'AZURE' | 'GCP'
  access_key_public: string
  secret_key: string
  tenant_id?: string
}

export interface Resource {
  id: string
  cloud_account_id: string
  resource_type: string
  resource_id: string
  region: string
  detail: Record<string, any>
}

export interface ScanTask {
  task_id: string
  state: string
  result?: any
  error?: any
}

export interface ConnectionTestResponse {
  Account: string
  UserId: string
  Arn: string
}

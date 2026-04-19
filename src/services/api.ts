import axios from 'axios'
import type {
  AdminOverview,
  AdminUserMonitor,
  AnomalyAlert,
  AnomalyFilters,
  ComparisonRow,
  CreateUserRequest,
  DayDetail,
  HouseMeta,
  HouseStats,
  HouseSummary,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  UploadResult,
  UserUploadItem,
  UserInfo,
} from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8010/api',
  timeout: 30000,
})

const TOKEN_KEY = 'dashboard_access_token'

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    return
  }
  localStorage.removeItem(TOKEN_KEY)
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)
  return data
}

export async function signup(payload: SignupRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/signup', payload)
  return data
}

export async function getMe(): Promise<UserInfo> {
  const { data } = await api.get<UserInfo>('/auth/me')
  return data
}

export async function getHouses(): Promise<HouseMeta[]> {
  const { data } = await api.get<HouseMeta[]>('/houses')
  return data
}

export async function getHouseSummary(id: number): Promise<HouseSummary> {
  const { data } = await api.get<HouseSummary>(`/houses/${id}/summary`)
  return data
}

export async function getAnomalies(id: number, filters: AnomalyFilters = {}): Promise<AnomalyAlert[]> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })

  const { data } = await api.get<AnomalyAlert[]>(`/houses/${id}/anomalies`, { params })
  return data
}

export async function getDayDetail(id: number, date: string): Promise<DayDetail> {
  const { data } = await api.get<DayDetail>(`/houses/${id}/day/${date}`)
  return data
}

export async function getStats(id: number): Promise<HouseStats> {
  const { data } = await api.get<HouseStats>(`/houses/${id}/stats`)
  return data
}

export async function getComparison(): Promise<ComparisonRow[]> {
  const { data } = await api.get<ComparisonRow[]>('/comparison')
  return data
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const { data } = await api.get<AdminOverview>('/admin/overview')
  return data
}

export async function getAdminUsers(): Promise<UserInfo[]> {
  const { data } = await api.get<UserInfo[]>('/admin/users')
  return data
}

export async function getAdminUsersMonitor(): Promise<AdminUserMonitor[]> {
  const { data } = await api.get<AdminUserMonitor[]>('/admin/users-monitor')
  return data
}

export async function createAdminUser(payload: CreateUserRequest): Promise<UserInfo> {
  const { data } = await api.post<UserInfo>('/admin/users', payload)
  return data
}

export async function uploadUserCsv(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<UploadResult>('/user/uploads', formData, {
    timeout: 300000,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function getUserUploads(): Promise<UserUploadItem[]> {
  const { data } = await api.get<UserUploadItem[]>('/user/uploads')
  return data
}

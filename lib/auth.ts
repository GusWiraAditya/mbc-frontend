import api from './api'

export type LoginCredentials = {
  email: string
  password: string
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  roles?: string[];
}

export interface AuthenticatedUser {
    user: User;
    roles: string[];
}

export const getCsrfCookie = async (): Promise<void> => {
  try {
    await api.get('/sanctum/csrf-cookie')
  } catch (error) {
    throw error
  }
}

export const loginCustomer = async (credentials: LoginCredentials): Promise<any> => {
  try {
    await getCsrfCookie()
    const response = await api.post('/login', credentials)
    return response.data
  } catch (error) {
    throw error
  }
}

export const loginAdmin = async (credentials: LoginCredentials): Promise<any> => {
  try {
    await getCsrfCookie()
    const response = await api.post('/login-admin', credentials)
    return response.data
  } catch (error) {
    throw error
  }
}

export const logout = async () => {
  try {
    await api.post('http://localhost:8000/logout', {}, { withCredentials: true });
  } catch (error) {
    throw error;
  }
};

export const getAuthenticatedUser = async (): Promise<AuthenticatedUser> => {
  try {
    const response = await api.get<AuthenticatedUser>('/user'); 
    return response.data;
  } catch (error) {
    // Biarkan error dilempar agar bisa ditangani oleh store.
    // Tidak perlu console.log atau console.error di sini.
    throw error;
  }
};

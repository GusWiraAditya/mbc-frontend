import api from './api';

export type LoginCredentials = {
  email: string;
  password: string;
};

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
    await api.get('/sanctum/csrf-cookie');
  } catch (error) {
    // console.error('CSRF cookie fetch failed:', error);
    throw error;
  }
};

export const loginAdmin = async (credentials: LoginCredentials): Promise<AuthenticatedUser> => {
  try {
    await getCsrfCookie();
    await api.post('/login-admin', credentials);
    
    // Immediately fetch user data after successful login
    const userResponse = await api.get<AuthenticatedUser>('/user');
    return userResponse.data;
  } catch (error) {
    // console.error('Admin login failed:', error);
    throw error;
  }
};

export const loginCustomer = async (credentials: LoginCredentials): Promise<AuthenticatedUser> => {
  try {
    await getCsrfCookie();
    await api.post('/login', credentials);

    // Immediately fetch user data after successful login
    const userResponse = await api.get<AuthenticatedUser>('/user');
    return userResponse.data;
  } catch (error) {
    console.error('Customer login failed:', error);
    throw error;
  }
};

/**
 * REVISI: Fungsi logout sekarang hanya memanggil API.
 * Ia tidak lagi melakukan pengalihan (window.location.href).
 * Tugas pengalihan akan ditangani oleh store.
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/logout');
  } catch (error) {
    console.error("Logout API call failed:", error);
    throw error;
  }
};

export const getAuthenticatedUser = async (): Promise<AuthenticatedUser> => {
  try {
    const response = await api.get<AuthenticatedUser>('/user');
    return response.data;
  } catch (error) {
    // console.error('Get authenticated user failed:', error);

    throw error;
  }
};

// New: Check if user is authenticated without throwing
export const checkAuthStatus = async (): Promise<{ isAuthenticated: boolean; user?: AuthenticatedUser }> => {
  try {
    const userData = await getAuthenticatedUser();
    return { isAuthenticated: true, user: userData };
  } catch (error) {
    return { isAuthenticated: false };
  }
};
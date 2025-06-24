import api from './api'

/**
 * Tipe data untuk kredensial login.
 */
export type LoginCredentials = {
  email: string
  password: string
}

export type AuthenticatedUser = {
  user: {
    id: number;
    name: string;
    email: string;
  };
  roles: string[]; // Contoh: ['admin', 'editor']
};

/**
 * Mengambil cookie CSRF dari Laravel Sanctum.
 * Wajib sebelum request POST/PUT/DELETE agar tidak gagal CSRF.
 */
export const getCsrfCookie = async (): Promise<void> => {
  try {
    await api.get('/sanctum/csrf-cookie')
  } catch (error) {
    console.error('Gagal mengambil CSRF cookie:', error)
    throw error
  }
}

/**
 * Proses login untuk customer.
 * @param credentials Email dan password customer
 * @returns Data user dari response Laravel
 */
export const loginCustomer = async (credentials: LoginCredentials): Promise<any> => {
  try {
    await getCsrfCookie()
    const response = await api.post('/login', credentials)
    return response.data
  } catch (error) {
    console.error('Login customer gagal:', error)
    throw error
  }
}

/**
 * Proses login untuk admin.
 * @param credentials Email dan password admin
 * @returns Data user dari response Laravel
 */
export const loginAdmin = async (credentials: LoginCredentials): Promise<any> => {
  try {
    await getCsrfCookie()
    const response = await api.post('/login-admin', credentials)
    return response.data
  } catch (error) {
    console.error('Login admin gagal:', error)
    throw error
  }
}

export const logout = async () => {
  try {
    await api.post('http://localhost:8000/logout', {}, { withCredentials: true });

    // Kosongkan store/user context
    // Contoh:
    // setUser(null); // dari Zustand atau Context
  } catch (error) {
    console.error('Logout gagal:', error);
  }
};

/**
 * Mengambil data user yang sedang login dari backend.
 * Mengembalikan data user beserta roles-nya.
 */
export const getAuthenticatedUser = async (): Promise<AuthenticatedUser> => {
  try {
    // Pastikan endpoint ini benar, biasanya '/api/user' pada Laravel
    const response = await api.get<AuthenticatedUser>('/user'); 
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data user:', error);
    throw error;
  }
};

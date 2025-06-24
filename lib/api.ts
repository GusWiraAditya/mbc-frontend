import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000",
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true
});

// Interceptor untuk menangani response secara global
api.interceptors.response.use(
  // Biarkan response sukses lewat begitu saja
  (response) => response,
  // Tangani jika ada error pada response
  (error) => {
    // Jika error karena token tidak valid/kedaluwarsa (401)
    if (error.response?.status === 401) {
      // Anda bisa redirect ke halaman login di sini
      // window.location.href = '/login'; 
      console.log("Sesi tidak valid, perlu login ulang.");
    }

    // Jika error karena CSRF token mismatch (sering terjadi jika halaman tidak di-refresh lama)
    if (error.response?.status === 419) {
      console.log("Token CSRF tidak valid. Silakan muat ulang halaman.");
      // Anda bisa memaksa refresh halaman atau menampilkan notifikasi
      // window.location.reload();
    }
    
    // Penting: Lemparkan kembali error agar blok .catch() di 'auth.ts' tetap berjalan
    return Promise.reject(error);
  }
);

export default api;
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // REVISI: Hapus console.log di sini, karena sudah ditangani di level store.
      // console.log("Sesi tidak valid, perlu login ulang."); // <-- HAPUS ATAU KOMENTARI BARIS INI
    }
    // ...
    return Promise.reject(error);
  }
);

export default api;
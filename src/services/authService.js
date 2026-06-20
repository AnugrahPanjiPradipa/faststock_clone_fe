// src/services/authService.js
import axios from "axios";

const API_URL = "https://faststock-clone-be.vercel.app/api/auth"; // Sesuaikan dengan port backend Anda

export const register = async (username, email, password, role) => {
  try {
    const res = await axios.post(`${API_URL}/register`, {
      username,
      email,
      password,
      role,
    });
    return res.data;
  } catch (error) {
    // Menangkap pesan error dari backend jika ada (misal: username sudah terpakai)
    throw error.response?.data || error.message;
  }
};

export const login = async (username, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { username, password });

    if (res.data.token) {
      // Simpan token untuk otorisasi endpoint
      localStorage.setItem("token", res.data.token);

      // Mengambil role untuk keperluan RBAC di Frontend
      // Mendukung 2 kemungkinan struktur response backend:
      // 1. { token: "...", role: "admin" } -> res.data.role
      // 2. { token: "...", user: { role: "admin" } } -> res.data.user.role
      const userRole = res.data.role || (res.data.user && res.data.user.role);

      if (userRole) {
        localStorage.setItem("role", userRole);
      }
    }
    return res.data;
  } catch (error) {
    // Menangkap pesan error spesifik dari backend (misal: "Password salah")
    throw error.response?.data || error.message;
  }
};

export const logout = () => {
  // Bersihkan seluruh data sesi saat user keluar
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};

export const verifyEmail = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/verifyemail/${token}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await axios.post(`${API_URL}/forgotpassword`, { email });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const res = await axios.put(`${API_URL}/resetpassword/${token}`, {
      password,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

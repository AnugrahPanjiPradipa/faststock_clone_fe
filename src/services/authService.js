// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // sesuaikan port backend

export const register = async (username, password, role) => {
  const res = await axios.post(`${API_URL}/register`, { username, password, role });
  return res.data;
};

export const login = async (username, password) => {
  const res = await axios.post(`${API_URL}/login`, { username, password });
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('role', res.data.role);
  }
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

// auth.js - Frontend API calls

const API_URL = 'http://localhost:5000/api';

// Register User
export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important for cookies
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Login User
export const login = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  
  if (data.success) {
    // Save token to localStorage (backup)
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};

// Get Current User
export const getMe = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { 
      'Authorization': `Bearer ${token}` 
    },
    credentials: 'include'
  });
  return response.json();
};

// Logout
export const logout = async () => {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
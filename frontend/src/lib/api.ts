import axios from 'axios'

// Determine base URL, fallback to localhost in dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const API_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('darukaa_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle 401s (e.g. expired token) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect here to avoid infinite loops if checking /me
      // But we can clear the token if it's explicitly an auth error on a protected route
      if (
        !error.config.url.includes('/auth/login') &&
        !error.config.url.includes('/auth/register')
      ) {
        localStorage.removeItem('darukaa_token')
        // Dispatch an event so the AuthContext can listen and update state
        window.dispatchEvent(new Event('auth:unauthorized'))
      }
    }
    return Promise.reject(error)
  },
)

import axios from 'axios'

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000/api'

export async function validateToken(token) {
  try {
    const response = await axios.get(`${API_BASE}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Token validation failed:', error)
    return { success: false }
  }
}

export function getToken() {
  return localStorage.getItem('retromail_token')
}

export function logout() {
  localStorage.removeItem('retromail_token')
  localStorage.removeItem('retromail_user')
}

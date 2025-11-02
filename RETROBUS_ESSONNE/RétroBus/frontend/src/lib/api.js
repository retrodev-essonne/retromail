import axios from 'axios'

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000/api'

const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('retromail_token')}`
})

export async function getMessages(folder = 'inbox') {
  try {
    const response = await axios.get(`${API_BASE}/notifications?folder=${folder}`, {
      headers: getHeaders()
    })
    return response.data.messages || []
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return []
  }
}

export async function getMessageDetail(id) {
  try {
    const response = await axios.get(`${API_BASE}/notifications/${id}`, {
      headers: getHeaders()
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch message:', error)
    return null
  }
}

export async function sendMessage(to, subject, body) {
  try {
    const response = await axios.post(`${API_BASE}/notifications/send`, 
      { to, subject, body },
      { headers: getHeaders() }
    )
    return response.data
  } catch (error) {
    console.error('Failed to send message:', error)
    throw error
  }
}

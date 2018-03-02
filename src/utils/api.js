import axios from 'axios'

const isProduction = !!(process.env.NODE_ENV === 'production')
const baseURL = isProduction ? 'http://59.175.16.123:5556/' : 'http://59.175.16.123:5556/'

// smart service
const api = axios.create({
  baseURL: baseURL,
  // withCredentials: true,
  timeout: 30000
})

export default api
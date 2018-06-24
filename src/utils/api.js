import axios from 'axios'

const isProduction = !!(process.env.NODE_ENV === 'production')
// const baseURL = isProduction ? 'http://120.24.244.225/amazonweb' : 'http://50.116.4.46:8082'
const baseURL = isProduction ? 'http://120.24.244.225/amazonweb' : 'http://50.116.4.46:8082'
const tokenKey = 'x-auth-token'

// smart service
const api = axios.create({
  baseURL: baseURL,
  // withCredentials: true,
  timeout: 0
})

const getToken = () => {
  return window.sessionStorage.getItem(tokenKey)
}

api.baseURL = baseURL
api.tokenKey = tokenKey
api.getToken = getToken

api.interceptors.request.use(config => {
  if (config.url.indexOf('/login') === -1) {
    config.headers[tokenKey] = getToken()
  }
  return config
})

export default api

import axios from 'axios'
// import env from '../../config'

// const isProduction = !!(process.env.NODE_ENV === 'production')
// const environment = isProduction ? env.build.env : env.dev.env

const ajaxUrl = process.env.NODE_ENV === 'development' ? 'http://nstart.cc' : process.env.NODE_ENV === 'production' ? 'http://nstart.cc' : 'https://debug.url.com'

// node service
const service = axios.create({
  baseURL: ajaxUrl,

  // baseURL: environment.servicesCenter.baseURL,
  withCredentials: true,
  timeout: 30000
})

export default service

import api from './api'
import moment from 'moment'

let commonPlugin = {}
commonPlugin.install = function (Vue, options) {
  Vue.prototype.$sendDownloadHistory = function (filename) {
    const userId = JSON.parse(localStorage.getItem('userInfo')).userId
    const time = moment().format('YYYY-MM-DD HH:mm')
    const file = filename
    api.post('/api/download_history', {userId, time, file}).then(res => {
    })
  }
}

export default commonPlugin

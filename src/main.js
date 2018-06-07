// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui'
import ECharts from 'vue-echarts/components/ECharts'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App'
import router from './router'
import store from './store'
import { role } from './filter/role'
import '../static/style/element-variables.scss'
import commonPlugin from './utils/util'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(commonPlugin)
Vue.component('chart', ECharts)

Vue.filter('role', role)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})

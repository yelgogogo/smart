import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login'
import Main from '@/views/Main'
import Expand from '@/views/Expand/Expand'
import Analysis from '@/views/Analysis/Analysis'
import Products from '@/views/Products/Products'
import AddProduct from '@/views/Products/Add'
import Setting from '@/views/Setting/Setting'
import config from '@/views/config/config'
import feedback from '@/views/feedback/feedback'
import competitorFeedback from '@/views/competitors/competitor-feedback'
import orders from '@/views/Products/orders'
import feedbackTotal from '@/views/feedback/feedback-total'
import WorkFlow from '@/views/workflow/workflow'
import Ads from '@/views/Products/Ads'
import mailSetting from '@/views/config/mailSetting'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/main',
      name: 'main',
      component: Main,
      children: [
        {
          path: '',
          name: 'workflow',
          component: WorkFlow
        },
        {
          path: 'test',
          name: 'test',
          component: Expand
        },
        {
          path: 'analysis',
          name: 'analysis',
          component: Analysis
        },
        {
          path: 'products',
          name: 'products',
          component: Products
        },
        {
          path: 'orders',
          name: 'orders',
          component: orders
        },
        {
          path: 'ads',
          name: 'ads',
          component: Ads
        },
        {
          path: 'add-product',
          name: 'add-product',
          component: AddProduct
        },
        {
          path: 'edit-product',
          name: 'edit-product',
          component: AddProduct
        },
        {
          path: 'workflow',
          name: 'workflow',
          component: WorkFlow
        },
        {
          path: 'setting',
          name: 'setting',
          component: Setting
        },
        {
          path: 'competitor-feedback',
          name: 'competitor-feedback',
          component: competitorFeedback
        },
        {
          path: 'feedback',
          name: 'feedback',
          component: feedback
        },
        {
          path: 'feedback-total',
          name: 'feedback-total',
          component: feedbackTotal
        },
        {
          path: 'config',
          name: 'config',
          component: config
        },
        {
          path: 'mailSetting',
          name: 'mailSetting',
          component: mailSetting
        }
      ]
    }
  ]
})

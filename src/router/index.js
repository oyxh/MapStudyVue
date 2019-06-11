import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [// 一级路由
    {
      path: '/',
      name: 'login',
      component: () => import('../components/login/login.vue')
    },
    {
      path: '/index',
      name: 'index',
      component: () => import('../components/index/index.vue'),
      children: [// 二级路由
        {
          path: '/one',
          name: 'one',
          component: () => import('../components/MapWindow.vue')
        },
        {
          path: '/two',
          name: 'two',
          component: () => import('../components/index/two.vue')
        }
      ]
    }
  ]
})

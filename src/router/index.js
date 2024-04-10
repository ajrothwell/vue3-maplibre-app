import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/:topic',
      name: 'topic',
      component: Home
    },
    {
      path: '/:address',
      name: 'address',
      component: Home,
      // component: () => import('@/views/TopicPanel.vue'),
    },
    {
      path: '/:address/:topic',
      name: 'address-and-topic',
      component: Home,
      // component: () => import('@/views/TopicPanel.vue'),
    },
  ]
})

export default router

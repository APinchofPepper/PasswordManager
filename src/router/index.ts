import { createRouter, createWebHistory } from 'vue-router'
import { UserManager } from '@/models/User'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../App.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const currentUser = UserManager.getCurrentUser()
  next()
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import { UserManager } from '@/models/User'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // You can add more routes here in the future
    // For now, we'll keep it minimal
  ]
})

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
  const currentUser = UserManager.getCurrentUser()
  
  // Add route protection logic if needed
  // For example, redirect to login if trying to access protected routes
  // if (to.meta.requiresAuth && !currentUser) {
  //   next('/login')
  // } else {
  //   next()
  // }
  
  next()
})

export default router
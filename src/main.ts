import './assets/main.css'
import { createApp } from 'vue'
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import App from './App.vue'
import router from './router'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

// Check for dark mode preference
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark')
}

const app = createApp(App)

// Configure toast notifications
app.use(VueToast, {
  position: 'bottom-right',
  duration: 3000,
  pauseOnHover: true,
})

// Add auto-animate for smooth transitions
app.use(autoAnimatePlugin)

app.use(router)
app.mount('#app')

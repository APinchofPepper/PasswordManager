import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    define: {
      // Safely load environment variables
      'import.meta.env.VITE_ENCRYPTION_SECRET': JSON.stringify(env.VITE_ENCRYPTION_SECRET || '')
    },
    // Optional: Add CSS preprocessor options if needed
    css: {
      preprocessorOptions: {
        scss: {
          // Example of adding global styles
          additionalData: `@import "./src/assets/styles/variables.scss";`
        }
      }
    }
  }
})
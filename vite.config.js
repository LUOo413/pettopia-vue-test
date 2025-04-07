import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({

  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['6ad5-59-125-142-166.ngrok-free.app'],
    proxy: {
      '/oauth2': 'https://vmtest-1-w8r3.onrender.com',
      '/api': 'https://vmtest-1-w8r3.onrender.com'
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    'global': 'window' // 讓 `global` 指向 `window`
  }

})

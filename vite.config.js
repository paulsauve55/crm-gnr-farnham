import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/crm-gnr-farnham/',
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  }
})

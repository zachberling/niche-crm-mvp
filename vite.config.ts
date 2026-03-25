import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
              return 'state-vendor'
            }
            if (id.includes('zod')) {
              return 'validation-vendor'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})

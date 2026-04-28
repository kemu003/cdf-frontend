import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow connections from all hosts
    proxy: {
      '/api': {
        target: 'https://cdf-backend.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  // Optional: For development environment variables
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://cdf-backend.onrender.com/api/'),
  },
})
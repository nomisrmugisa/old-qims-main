import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/main/',
  server: {
    proxy: {
      '/api': {
        target: 'https://qimsdev.5am.co.bw/qims/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
      '/email2': {
        target: 'https://qimsdev.5am.co.bw',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/email2/, '/email2'),
      },
    }
  },
  preview: {
      open: true,
      host: true,
      allowedHosts: ["qimsdev.5am.co.bw"]
  },
  optimizeDeps: {
    include: ['@mui/material', '@mui/icons-material'],
  },

})

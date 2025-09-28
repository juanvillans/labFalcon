import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['@nivo/bar', '@nivo/pie', '@nivo/core'],
          utils: ['axios', 'lodash.debounce']
        }
      }
    },
    minify: 'esbuild', // Más rápido que terser
    target: 'es2015'
  },
  optimizeDeps: {
    include: ['@mui/material', '@nivo/bar', '@nivo/pie']
  }
});



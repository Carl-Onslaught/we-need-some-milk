import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const apiURL = process.env.VITE_API_URL || 'http://localhost:5001'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: `${apiURL}`,
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.')[1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images';
          } else if (/mp3|wav|ogg/i.test(extType)) {
            extType = 'sounds';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
      },
    },
  },
})

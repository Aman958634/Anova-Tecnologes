import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  publicDir: 'public',
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    emptyOutDir: true,
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion') || id.includes('axios')) {
              return 'vendor-ui';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    port: 5175,
    host: '0.0.0.0'
  }
}));

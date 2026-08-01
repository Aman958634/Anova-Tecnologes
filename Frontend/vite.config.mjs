import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';

export default defineConfig(({ mode }) => ({
  publicDir: 'public',
  plugins: [
    react(),
    compression({
      algorithms: ['gzip', 'brotliCompress'],
    }),
  ],
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
            if (id.includes('three')) {
              return 'vendor-three';
            }
            return 'vendor';
          }
        },
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').at(-1) || '';
          if (['woff2', 'woff', 'ttf', 'eot'].includes(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif'].includes(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 5175,
    host: '0.0.0.0'
  }
}));

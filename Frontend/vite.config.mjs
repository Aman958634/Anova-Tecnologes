import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { visualizer } from 'rollup-plugin-visualizer';

function getPackageName(id) {
  const normalized = id.replace(/\\/g, '/');
  const match = normalized.match(/node_modules\/(.*?)(\/|$)/);
  if (!match) return null;
  const pkg = match[1];
  if (pkg.startsWith('@')) {
    const scoped = normalized.match(/node_modules\/(@[^\/]+\/[^\/]+)(\/|$)/);
    return scoped ? scoped[1] : pkg;
  }
  return pkg;
}

export default defineConfig(({ mode }) => ({
  publicDir: 'public',
  plugins: [
    react(),
    compression({
      algorithms: ['gzip', 'brotliCompress'],
    }),
    process.env.ANALYZE === 'true'
      ? visualizer({
          filename: 'dist/bundle-stats.html',
          gzipSize: true,
          brotliSize: true,
          open: false,
        })
      : null,
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
          if (!id.includes('node_modules')) return;

          const pkg = getPackageName(id);

          if (!pkg) return 'vendor';

          if (pkg === 'react' || pkg === 'react-dom' || pkg === 'scheduler') {
            return 'framework';
          }

          if (pkg === 'react-router-dom' || pkg === 'react-router' || pkg === 'history') {
            return 'router';
          }

          if (pkg === 'framer-motion') {
            return 'motion';
          }

          if (pkg === 'three') {
            return 'graphics';
          }

          if (pkg === 'lucide-react') {
            return 'icons';
          }

          if (pkg === 'axios') {
            return 'network';
          }

          if (pkg === 'react-helmet-async' || pkg === 'react-hot-toast') {
            return 'ui-runtime';
          }

          return 'vendor';
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

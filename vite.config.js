import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        404: resolve(__dirname, '404.html'),
      },
    },
    // Copy assets as-is
    copyPublicDir: true,
  },
  publicDir: 'public',
  // Ensure proper path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});

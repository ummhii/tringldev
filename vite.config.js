import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: {
    open: false,
    port: 8080,
    hmr: false, // Disable hot module replacement
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        404: resolve(__dirname, '404.html'),
        blog: resolve(__dirname, 'blog.html'),
        music: resolve(__dirname, 'music.html'),
        projects: resolve(__dirname, 'projects.html'),
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

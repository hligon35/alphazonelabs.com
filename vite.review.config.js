import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  root: 'review-app',
  publicDir: false,
  build: {
    outDir: '../review-dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        login: resolve(__dirname, 'review-app/index.html'),
        dashboard: resolve(__dirname, 'review-app/dashboard.html'),
        submit: resolve(__dirname, 'review-app/submit.html'),
      },
    },
  },
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
});

/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works from any sub-path (e.g. GitHub Pages).
// Three pages: the app (index.html), the admin panel (admin.html) and the delete-my-data page (delete.html).
// In dev, /api goes to the API server (npm run server).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { app: 'index.html', admin: 'admin.html', delete: 'delete.html' },
      output: {
        // The built-in grammar is big and only the grammar pages need it: keep it in its own file so
        // the bundler doesn't merge it into something every page loads at startup.
        manualChunks: (id) => (/[\/]src[\/]data[\/]grammar[\/]/.test(id) ? 'grammar-content' : undefined),
      },
    },
  },
  server: {
    proxy: { '/api': 'http://localhost:8787' },
  },
  // Unit tests only; the browser tests in e2e/ run with `npm run e2e`.
  test: { exclude: ['**/node_modules/**', 'e2e/**'] },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works from any sub-path (e.g. GitHub Pages).
// Two pages: the app (index.html) and the admin panel (admin.html).
// In dev, /api goes to the API server (npm run server).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { app: 'index.html', admin: 'admin.html' },
    },
  },
  server: {
    proxy: { '/api': 'http://localhost:8787' },
  },
});

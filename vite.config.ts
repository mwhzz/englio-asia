/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** Writes offline-files.json: the app's built files, which "download for offline" keeps (see public/sw.js); not the admin, nor font subsets the app never shows. */
function offlineFiles(): Plugin {
  return {
    name: 'offline-files',
    apply: 'build',
    generateBundle(_, bundle) {
      const files = ['./', ...Object.keys(bundle).filter((f) => !/admin|delete|cyrillic|greek|vietnamese|wdth/.test(f)).map((f) => `./${f}`)];
      this.emitFile({ type: 'asset', fileName: 'offline-files.json', source: JSON.stringify(files) });
    },
  };
}

// Relative base so the build works from any sub-path (e.g. GitHub Pages).
// Three pages: the app (index.html), the admin panel (admin.html) and the delete-my-data page (delete.html).
// In dev, /api goes to the API server (npm run server).
export default defineConfig({
  base: './',
  plugins: [react(), offlineFiles()],
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

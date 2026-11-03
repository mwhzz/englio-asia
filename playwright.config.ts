import { defineConfig, devices } from '@playwright/test';

// `npm run e2e`: the real app, admin and API in a phone-sized Chrome, against a fresh database.
// First time on a new computer: `npx playwright install chromium`.
const API = 8799;
const APP = 5299;

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Pixel 7'],
    baseURL: `http://localhost:${APP}`,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      // A throwaway database (and upload folder), deleted and seeded fresh for every run.
      command: `node -e "for (const f of ['e2e/.e2e.db', 'e2e/.e2e.db-wal', 'e2e/.e2e.db-shm', 'e2e/.media']) require('fs').rmSync(f, { recursive: true, force: true })" && node server/seedMain.ts && node server/main.ts`,
      env: { DB_PATH: 'e2e/.e2e.db', MEDIA_DIR: 'e2e/.media', PORT: String(API), ADMIN_TOKEN: 'e2e-admin' },
      url: `http://localhost:${API}/api/health`,
      reuseExistingServer: false,
    },
    {
      command: `npx vite --port ${APP} --strictPort`,
      env: { VITE_API_URL: `http://localhost:${API}/api` },
      url: `http://localhost:${APP}`,
      reuseExistingServer: false,
    },
  ],
});

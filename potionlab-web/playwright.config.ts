import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  reporter: 'list',
  use: {
    headless: true,
    trace: 'on-first-retry',
    baseURL: 'http://127.0.0.1:5179',
    viewport: { width: 1920, height: 1080 },
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5179 --strictPort',
    url: 'http://127.0.0.1:5179',
    reuseExistingServer: !process.env.CI,
  },
});

import { defineConfig, devices } from '@playwright/test';

const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;
// The browser-compatibility story (S-12) is the only spec run on Firefox and WebKit.
const BROWSER_COMPATIBILITY_SPEC = /p0-s12-.*\.spec\.ts/;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: BROWSER_COMPATIBILITY_SPEC,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: BROWSER_COMPATIBILITY_SPEC,
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});

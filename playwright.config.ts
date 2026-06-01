import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Increase default navigation and action timeouts for auth flows
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Global test timeout: 3 minutes (auth flows need to wait for emails)
  timeout: 180_000,
  expect: {
    timeout: 15_000,
  },
  // Uncomment to auto-start dev server (requires `pnpm dev` to listen on port 4321)
  // webServer: {
  //   command: 'pnpm dev',
  //   port: 4321,
  //   reuseExistingServer: true,
  //   timeout: 120_000,
  // },
});

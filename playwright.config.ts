import { defineConfig, devices } from '@playwright/test'

const port = Number.parseInt(process.env.PLAYWRIGHT_PORT || process.env.PORT || '', 10) || 3002
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${port}`
const webServerEnv: Record<string, string> = Object.fromEntries(
  Object.entries(process.env).filter(([, v]) => typeof v === 'string') as Array<
    [string, string]
  >
)
webServerEnv.DEMO_MODE = webServerEnv.DEMO_MODE || 'true'
webServerEnv.NEXT_PUBLIC_DEMO_MODE = webServerEnv.NEXT_PUBLIC_DEMO_MODE || webServerEnv.DEMO_MODE
webServerEnv.ELDRUN_DEPLOYMENT =
  webServerEnv.ELDRUN_DEPLOYMENT || webServerEnv.VERCEL_ENV || (process.env.CI ? 'staging' : 'development')

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
  },
  webServer: {
    command: `pnpm exec next build && pnpm exec next start -p ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 300_000,
    env: webServerEnv,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

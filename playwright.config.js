const {defineConfig, devices} = require('@playwright/test')

module.exports = defineConfig({
  testDir: './test',
  timeout: 30000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']}
    }
  ],
  webServer: {
    command: 'npx quasar dev -p 8080',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
    timeout: 120000
  }
})

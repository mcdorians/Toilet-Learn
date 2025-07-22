// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  webServer: {
    command: 'python3 -m http.server 3000',
    port: 3000,
    reuseExistingServer: true
  },
  use: { baseURL: 'http://localhost:3000' }
});

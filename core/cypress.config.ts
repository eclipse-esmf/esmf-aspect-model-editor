import { defineConfig } from 'cypress'

export default defineConfig({
  fileServerFolder: '.',
  fixturesFolder: 'apps/ame-e2e/src/fixtures',
  modifyObstructiveCode: false,
  viewportWidth: 1920,
  viewportHeight: 1080,
  reporter: 'node_modules/mochawesome/src/mochawesome.js',
  video: false,
  videoUploadOnPasses: false,
  screenshotOnRunFailure: false,
  videosFolder: 'apps/ame-e2e/cypress/videos',
  screenshotsFolder: 'apps/ame-e2e/cypress/screenshots',
  chromeWebSecurity: false,
  defaultCommandTimeout: 20000,
  reporterOptions: {
    reportDir: 'apps/ame-e2e/cypress/reports',
    overwrite: false,
    html: true,
    saveHtml: true,
    reportPageTitle: 'Aspect Model Editor Tests',
    reportTitle: 'Aspect Model Editor Tests',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./apps/ame-e2e/src/plugins/index.js')(on, config)
    },
    specPattern: 'apps/ame-e2e/src/integration/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:4200/',
    supportFile: 'apps/ame-e2e/src/support/index.ts',
  },
})

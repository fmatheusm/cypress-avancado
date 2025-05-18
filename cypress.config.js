const { defineConfig } = require("cypress");
require('dotenv').config();
/**
 * @type {Cypress.PluginConfig}
 */

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 4000,
    responseTimeout: 100000,
    chromeWebSecurity: false,
  },
});

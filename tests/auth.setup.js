const { test: setup } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { WorkListPage } = require('../pages/WorkListPage');

const AUTH_FILE = 'playwright/.auth/user.json';

setup('Login to Portal', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto(process.env.BASE_URL);
  await loginPage.login(process.env.PEGA_USERNAME, process.env.PEGA_PASSWORD);

  const workListPage = new WorkListPage(page);
  await workListPage.waitForLoaded();

  await page.context().storageState({ path: AUTH_FILE });
});

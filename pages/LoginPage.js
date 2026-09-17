const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    // Pega's native login form exposes labeled Operator ID / Password
    // fields. getByLabel is preferred over the auto-generated `pyxxx`
    // input IDs, which are unstable across environments and rule versions.
    this.userIdInput = page.getByLabel(/operator id|user ?name/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.loginButton = page.getByRole('button', { name: /log ?in/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username, password) {
    await this.userIdInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.waitForIdle();
  }
}

module.exports = { LoginPage };

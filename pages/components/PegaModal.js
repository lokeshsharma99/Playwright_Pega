const { waitForPegaIdle, retryClick } = require('../../utils/waits');

/**
 * Reusable helper for Pega's local-action / modal harnesses. Classic Pega
 * renders these inside their own iframe layered above the primary portal
 * frame, so they need their own frame-scoped locators rather than reusing
 * BasePage.getContentFrame(). Holds itself to the same click/wait
 * robustness as BasePage.clickAndWait() (retry-on-detach, idle-wait on
 * both the modal frame and the top-level page) rather than a plain
 * `.click()` — the modal frame is exactly the kind of DOM that gets torn
 * down and re-rendered mid-interaction.
 *
 * Not yet wired into any page object or test — no current scenario
 * exercises a local-action modal. Left in place as scaffolding for when
 * one does, flagged explicitly here rather than silently shipping as
 * dead code: it has not been run, not even against a mock.
 */
class PegaModal {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    // TODO: confirm against the real portal — modal harness iframes are
    // often named like `ModalDialog` or `pzHarnessID_modal`.
    this.frame = page.frameLocator('iframe[name*="Modal" i]');
    this.submitButton = this.frame.getByRole('button', { name: /submit|save|done/i });
    this.cancelButton = this.frame.getByRole('button', { name: /cancel/i });
  }

  async waitForIdle() {
    await Promise.all([waitForPegaIdle(this.page), waitForPegaIdle(this.frame)]);
  }

  async submit() {
    await retryClick(this.submitButton);
    await this.waitForIdle();
  }

  async cancel() {
    await retryClick(this.cancelButton);
    await this.waitForIdle();
  }
}

module.exports = { PegaModal };

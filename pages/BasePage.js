const { waitForPegaIdle, retryClick } = require('../utils/waits');

// TODO: confirm against the real portal. Classic Pega harnesses typically
// render inside a named iframe (e.g. `ifprimaryportal`, `iFrame1`, or
// similar depending on portal config). Update once you've inspected the
// live DOM.
const PRIMARY_FRAME_SELECTOR = 'iframe[name="ifprimaryportal"]';

class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /**
   * Returns the FrameLocator for Pega's primary content harness.
   * Most work list / case content lives inside this frame, not the
   * top-level page.
   */
  getContentFrame() {
    return this.page.frameLocator(PRIMARY_FRAME_SELECTOR);
  }

  // Pega's processing overlay may render at the top-level document or
  // inside the primary content frame depending on which action triggered
  // it — checked in parallel so this stays a single wait, not double
  // latency. Once the live portal confirms one location, this can be
  // narrowed back to a single scope.
  async waitForIdle() {
    await Promise.all([waitForPegaIdle(this.page), waitForPegaIdle(this.getContentFrame())]);
  }

  async clickAndWait(locator) {
    await retryClick(locator);
    await this.waitForIdle();
  }
}

module.exports = { BasePage, PRIMARY_FRAME_SELECTOR };

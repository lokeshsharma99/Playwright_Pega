const { BasePage } = require('./BasePage');

/**
 * Common chrome for an open case harness: header, action buttons, tab
 * navigation. Feature-specific case content (custom sections, embedded
 * lists) belongs in a spec-level page object that composes this one, not
 * here.
 */
class CaseHarnessPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    const frame = this.getContentFrame();
    this.submitButton = frame.getByRole('button', { name: /submit/i });
    this.saveButton = frame.getByRole('button', { name: /save/i });
    this.cancelButton = frame.getByRole('button', { name: /cancel/i });
    // TODO: confirm against the real portal. Case header is usually
    // rendered as a heading — tries that accessible role first, falls
    // back to a CSS-class guess (same TODO class as BasePage's
    // PRIMARY_FRAME_SELECTOR). `.first()` matters here: `.or()` is a
    // union match, not "prefer the heading" — without it, an element
    // that happens to satisfy both sides would make assertions throw a
    // strict-mode violation instead of just resolving.
    this.caseIdLabel = frame
      .getByRole('heading')
      .or(frame.locator('.case-header, [class*="caseview-header"]'))
      .first();
  }

  tab(name) {
    return this.getContentFrame().getByRole('tab', { name });
  }

  async openTab(name) {
    await this.clickAndWait(this.tab(name));
  }

  async submit() {
    await this.clickAndWait(this.submitButton);
  }

  async save() {
    await this.clickAndWait(this.saveButton);
  }

  async cancel() {
    await this.clickAndWait(this.cancelButton);
  }
}

module.exports = { CaseHarnessPage };

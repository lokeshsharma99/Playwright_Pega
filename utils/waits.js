/**
 * Pega-specific wait helpers.
 *
 * Playwright's auto-wait does not know about Pega's own AJAX "processing"
 * cycle (the glass-pane/spinner shown while a harness or grid refreshes),
 * so actions can fire against a DOM that Pega is about to tear down and
 * re-render. These helpers close that gap.
 */

// TODO: confirm against the real portal. Tries the accessible signals
// first (`aria-busy`, `role="progressbar"`) since those survive markup
// churn better than a class name; falls back to Classic Pega's common
// CSS-based processing overlay candidates. Update once you've inspected
// the live DOM.
const PROCESSING_SELECTOR =
  '[aria-busy="true"], [role="progressbar"], .pega-processing, #pega_container_processing';

/**
 * Waits until Pega's processing indicator is gone from the given scope.
 * @param {import('@playwright/test').Page | import('@playwright/test').FrameLocator} scope
 */
async function waitForPegaIdle(scope) {
  const indicator = scope.locator(PROCESSING_SELECTOR);
  try {
    await indicator.waitFor({ state: 'hidden', timeout: 15_000 });
  } catch (error) {
    // Only swallow the "indicator never appeared" case — not every click
    // triggers a Pega AJAX round-trip. Any other failure (bad selector,
    // detached frame, etc.) should surface, not get masked as idle.
    if (error?.name !== 'TimeoutError') {
      throw error;
    }
  }
}

/**
 * Clicks a locator and retries once on failure, which covers the
 * stale/detached-element errors that happen when Pega re-renders a grid
 * or harness mid-interaction. Deliberately does not pattern-match the
 * error message (Playwright's exact wording for a detached element isn't
 * a stable contract across versions) — one unconditional retry is safer
 * than a string match that can silently stop matching and disable the
 * retry with no signal. If the retry also fails, its error propagates.
 * @param {import('@playwright/test').Locator} locator
 */
async function retryClick(locator) {
  try {
    await locator.click();
  } catch {
    await locator.click();
  }
}

module.exports = { waitForPegaIdle, retryClick, PROCESSING_SELECTOR };

/**
 * Thin wrapper around Pega's Case Management REST API, for test data
 * setup/teardown. Driving setup/cleanup through the API instead of the
 * UI is faster and more stable — reserve UI interaction for the behavior
 * actually under test.
 *
 * TODO: confirm against your real Pega instance. Classic Pega commonly
 * exposes case management endpoints under `/api/v1` (or
 * `/api/application/v2` on newer releases) or a custom `/PRRestService`
 * integration. Auth is often Basic auth with the same operator
 * credentials used for UI login, but some environments use OAuth —
 * adjust the request context in fixtures/test-fixtures.js accordingly.
 */
class PegaApiClient {
  /** @param {import('@playwright/test').APIRequestContext} request */
  constructor(request) {
    this.request = request;
  }

  /**
   * Creates a case directly via API — use in test setup so the test
   * itself only has to drive/verify the behavior under test, not case
   * creation.
   * @param {Record<string, unknown>} caseData
   * @returns {Promise<{ID: string}>}
   */
  async createCase(caseData) {
    const response = await this.request.post('/api/v1/cases', { data: caseData });
    if (!response.ok()) {
      throw new Error(`API case creation failed: ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }

  /**
   * Deletes/cancels a case via API — use in teardown so leftover test
   * cases don't accumulate in the work list between runs.
   * @param {string} caseId
   */
  async deleteCase(caseId) {
    const response = await this.request.delete(`/api/v1/cases/${encodeURIComponent(caseId)}`);
    if (!response.ok() && response.status() !== 404) {
      throw new Error(`API case cleanup failed for ${caseId}: ${response.status()}`);
    }
  }
}

module.exports = { PegaApiClient };

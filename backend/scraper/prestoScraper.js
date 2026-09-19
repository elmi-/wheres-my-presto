const { chromium } = require('playwright');
const selectors = require('./selectors');

class BadCredentialsError extends Error {}
class ScraperError extends Error {}

// Logs into prestocard.ca with the given credentials and returns the most
// recent card activity. Never logs the plaintext password.
async function fetchLastUse(username, password) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(selectors.loginUrl, { waitUntil: 'domcontentloaded' });

    await page.fill(selectors.usernameField, username);
    await page.fill(selectors.passwordField, password);
    await Promise.all([
      page.waitForLoadState('networkidle').catch(() => {}),
      page.click(selectors.submitButton),
    ]);

    const loginError = await page.locator(selectors.loginErrorText).first();
    if (await loginError.count() > 0 && await loginError.isVisible()) {
      throw new BadCredentialsError('Presto rejected the provided credentials');
    }

    await page.goto(selectors.activityUrl, { waitUntil: 'domcontentloaded' });

    const firstRow = page.locator(selectors.activityRow).first();
    if (await firstRow.count() === 0) {
      throw new ScraperError('could not find any activity rows — selectors may be stale');
    }

    const station = (await firstRow.locator(selectors.activityStation).innerText()).trim();
    const timestampText = (await firstRow.locator(selectors.activityTimestamp).innerText()).trim();

    return { station, timestampText };
  } catch (err) {
    if (err instanceof BadCredentialsError) throw err;
    throw new ScraperError(err.message);
  } finally {
    await browser.close();
  }
}

module.exports = { fetchLastUse, BadCredentialsError, ScraperError };

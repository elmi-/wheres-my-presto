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

    // prestocard.ca/en/login is just a marketing shell — its Sign In button
    // redirects to a separate Azure AD B2C tenant that hosts the real form.
    await page.goto(selectors.loginUrl, { waitUntil: 'domcontentloaded' });
    // Give the page's own redirect script (MSAL.js) time to finish
    // initializing — clicking immediately after domcontentloaded is
    // unreliable and can silently no-op.
    await page.waitForLoadState('networkidle').catch(() => {});

    // The page ships with a stuck MUI modal backdrop that intercepts real
    // pointer clicks on load (visible on the live site as an endless
    // "Loading" overlay). A normal page.click() correctly refuses to click
    // through it, so we dispatch the click via the DOM directly instead.
    //
    // The redirect itself is also intermittently flaky on Presto's end —
    // the click sometimes silently no-ops even after the page looks fully
    // loaded — so retry a couple of times before giving up.
    await page.locator(selectors.signInButton).waitFor({ state: 'attached' });
    let redirected = false;
    for (let attempt = 0; attempt < 3 && !redirected; attempt++) {
      await page.evaluate((sel) => document.querySelector(sel)?.click(), selectors.signInButton);
      try {
        await page.waitForURL(/b2clogin\.com/, { timeout: 8000, waitUntil: 'domcontentloaded' });
        redirected = true;
      } catch {
        // no-op this attempt, try clicking again
      }
    }
    if (!redirected) {
      throw new ScraperError('sign-in redirect never happened after 3 attempts — Presto\'s site may be having issues');
    }

    await page.fill(selectors.usernameField, username);
    await page.fill(selectors.passwordField, password);
    await Promise.all([
      page.waitForLoadState('networkidle').catch(() => {}),
      page.click(selectors.submitButton),
    ]);

    const loginError = page.locator(selectors.loginErrorText).first();
    if (await loginError.count() > 0 && await loginError.isVisible()) {
      throw new BadCredentialsError('Presto rejected the provided credentials');
    }

    await page.waitForURL((url) => url.hostname === selectors.successHostname, { timeout: 15000, waitUntil: 'domcontentloaded' });
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

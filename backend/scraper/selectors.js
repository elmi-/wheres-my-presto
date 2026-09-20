// Isolated Presto (prestocard.ca) DOM selectors, kept in one place because
// Presto can change their markup at any time and this is the single spot
// to fix when a sync starts failing.
//
// Login flow verified live (2026-09) against the real site:
//   1. prestocard.ca/en/login is just a marketing shell page — it does not
//      host the actual login form. Its "Sign In" button triggers a redirect
//      to a separate Azure AD B2C tenant (prestocardprodb2c.b2clogin.com).
//   2. The real email/password form and the "invalid credentials" error
//      live on that B2C page, not on prestocard.ca.
//   3. Presto accounts are keyed by EMAIL ADDRESS, not a separate username.
//
// NOT yet verified: the post-login activity/trip-history selectors below.
// No real Presto account was available to authenticate with, so these are
// still best-effort placeholders — update them once a real linked account
// exists and you can see the actual "my account" activity page.
module.exports = {
  loginUrl: 'https://www.prestocard.ca/en/login',
  signInButton: '#btn-sign-in',

  // These live on prestocardprodb2c.b2clogin.com after the redirect above.
  usernameField: '#signInName', // actually an email address field
  passwordField: '#password',
  submitButton: '#next',
  loginErrorText: '.error.pageLevel', // text: "Invalid email address or password."
  successHostname: 'www.prestocard.ca',

  // TODO: verify against the real post-login activity page.
  activityUrl: 'https://www.prestocard.ca/en/my-account/activity',
  activityRow: '.activity-row, .transaction-row',
  activityStation: '.transaction-location, .stop-name',
  activityTimestamp: '.transaction-date, .transaction-time',
};

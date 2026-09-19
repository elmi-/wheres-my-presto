// Isolated Presto (prestocard.ca) DOM selectors, kept in one place because
// Presto can change their markup at any time and this is the single spot
// to fix when a sync starts failing.
//
// TODO: prestocard.ca was down for maintenance when this was written, so
// these selectors are best-effort placeholders based on the site's general
// shape, not verified against the live DOM. Before relying on real syncs:
//   1. Visit loginUrl in a real browser and update the field/button selectors
//      to match the actual login form.
//   2. Log in manually, find the card activity / trip history page, and
//      update activityUrl + the row/station/timestamp selectors.
module.exports = {
  loginUrl: 'https://www.prestocard.ca/en/login',
  usernameField: '#username',
  passwordField: '#password',
  submitButton: 'button[type="submit"]',
  loginErrorText: '.login-error, .field-validation-error',

  activityUrl: 'https://www.prestocard.ca/en/my-account/activity',
  activityRow: '.activity-row, .transaction-row',
  activityStation: '.transaction-location, .stop-name',
  activityTimestamp: '.transaction-date, .transaction-time',
};

// Ensure only one auth method is configured
if (
  process.env.AWS_COGNITO_POOL_ID &&
  process.env.AWS_COGNITO_CLIENT_ID &&
  process.env.HTPASSWD_FILE
) {
  throw new Error('env has both Cognito and Basic Auth. Only one allowed.');
}

// Prefer Cognito in production
if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
  module.exports = require('./cognito');
}
// Use Basic Auth for tests / local
else if (process.env.HTPASSWD_FILE && process.env.NODE_ENV !== 'production') {
  module.exports = require('./basic-auth');
}
// No valid auth config
else {
  throw new Error('missing env vars: no authorization configuration found');
}

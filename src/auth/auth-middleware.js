// src/auth/auth-middleware.js
const passport = require('passport');
const hash = require('../hash');
const logger = require('../logger');

/**
 * authorize(strategyName)
 *
 * Returns an Express middleware that:
 * - Runs passport.authenticate(strategyName)
 * - On success, normalizes req.user to an object { email, id }
 *   where id is hashed email for DB usage
 * - On failure, returns a 401 error (JSON)
 */
module.exports = function authorize(strategy) {
  return (req, res, next) => {
    // Use passport's custom callback to control response
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) {
        logger.error({ err }, 'Error during authentication');
        return next(err);
      }
      if (!user) {
        // Not authorized
        logger.warn({ info }, 'Unauthorized request');
        return res.status(401).json({
          status: 'error',
          error: {
            code: 401,
            message: 'Unauthorized',
          },
        });
      }

      // `user` might be:
      // - a string (email) (your Cognito/basic auth implementation returns an email string)
      // - an object (user.email)
      let email;
      if (typeof user === 'string') {
        email = user;
      } else if (user && typeof user === 'object' && user.email) {
        email = user.email;
      } else {
        // If we can't find an email, treat as unauthorized
        logger.error({ user }, 'Authenticated principal missing email');
        return res.status(401).json({
          status: 'error',
          error: {
            code: 401,
            message: 'Unauthorized',
          },
        });
      }

      // Hash the email to create owner id for storage
      try {
        const ownerId = hash(email);
        req.user = { email, id: ownerId };
        logger.debug({ ownerId }, 'Authenticated user');
        return next();
      } catch (e) {
        logger.error({ err: e }, 'Error hashing user email');
        return next(e);
      }
    })(req, res, next);
  };
};

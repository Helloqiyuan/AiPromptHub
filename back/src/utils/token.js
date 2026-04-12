const jwt = require('jsonwebtoken');

const env = require('../config/env');

function signToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      username: user.username,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );
}

module.exports = {
  signToken,
};


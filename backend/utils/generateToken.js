const jwt = require('jsonwebtoken');

const generateToken = (memberId, role) => {
  return jwt.sign({ id: memberId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

module.exports = generateToken;

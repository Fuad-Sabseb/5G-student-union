const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');

// Verifies JWT and attaches the logged-in member to req.member
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.member = await Member.findById(decoded.id);

      if (!req.member) {
        res.status(401);
        throw new Error('Not authorized, member no longer exists');
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, invalid token');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

// Restricts access to admins only
const adminOnly = (req, res, next) => {
  if (req.member && req.member.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Admin access only');
  }
};

// Restricts access to admins and executive committee members
const execOrAdmin = (req, res, next) => {
  if (req.member && (req.member.role === 'admin' || req.member.role === 'exec')) {
    next();
  } else {
    res.status(403);
    throw new Error('Executive/Admin access only');
  }
};

module.exports = { protect, adminOnly, execOrAdmin };

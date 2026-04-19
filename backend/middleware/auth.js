const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = db.get('users').find({ _id: decoded.id }).value();
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      req.user = {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role
      };
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const ownerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'OWNER') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an owner' });
  }
};

module.exports = { protect, ownerOnly };

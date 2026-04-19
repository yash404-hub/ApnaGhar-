const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const loginUser = async (req, res) => {
  const { phone, password } = req.body;
  const user = db.get('users').find({ phone }).value();

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid phone or password' });
  }
};

const registerUser = async (req, res) => {
  const { name, phone, password, role } = req.body;
  const userExists = db.get('users').find({ phone }).value();

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    _id: Math.random().toString(36).substr(2, 9),
    name,
    phone,
    password: hashedPassword,
    role: role || 'TENANT',
    createdAt: new Date().toISOString()
  };

  db.get('users').push(newUser).write();

  res.status(201).json({
    _id: newUser._id,
    name: newUser.name,
    phone: newUser.phone,
    role: newUser.role,
    token: generateToken(newUser._id),
  });
};

const changePassword = async (req, res) => {
  const { newPassword } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  db.get('users')
    .find({ _id: req.user.id })
    .assign({ password: hashedPassword })
    .write();
    
  res.json({ message: 'Password updated successfully' });
};

module.exports = { loginUser, registerUser, changePassword };

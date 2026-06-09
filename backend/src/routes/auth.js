const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Sabhi fields bharo' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered hai' });

    const user = await User.create({ name, email, password });
    res.status(201).json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await user.comparePassword(password)))
//       return res.status(401).json({ message: 'Email ya password galat hai' });

//     res.json({ user, token: generateToken(user._id) });
//   } catch (err) {
//     console.error("LOGIN ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("EMAIL RECEIVED:", `"${email}"`);

    const allUsers = await User.find();
    console.log("ALL USERS:", allUsers.map(u => u.email));

    const user = await User.findOne({ email }).select('+password');

    console.log("FOUND USER:", user);

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: 'Email ya password galat hai'
      });
    }

    res.json({
      user,
      token: generateToken(user._id)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json(req.user));

module.exports = router;
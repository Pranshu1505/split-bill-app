const express = require('express');
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/groups — user ke saare groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/groups — naya group banao
router.post('/', async (req, res) => {
  try {
    const { name, description, currency, memberEmails, guestNames } = req.body;
    if (!name) return res.status(400).json({ message: 'Group ka naam do' });

    const User = require('../models/User');
    // Creator always first
    const members = [{ user: req.user._id, guestName: '' }];

    // Registered users by email
    if (memberEmails?.length) {
      for (const email of memberEmails) {
        if (!email.trim()) continue;
        const u = await User.findOne({ email: email.trim().toLowerCase() });
        if (u && u._id.toString() !== req.user._id.toString()) {
          members.push({ user: u._id, guestName: '' });
        }
      }
    }

    // Guest members by name (no account needed)
    if (guestNames?.length) {
      for (const gName of guestNames) {
        if (gName.trim()) {
          members.push({ user: null, guestName: gName.trim() });
        }
      }
    }

    const group = await Group.create({
      name, description, currency: currency || '₹',
      createdBy: req.user._id, members,
    });

    const populated = await group.populate('members.user', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/groups/:id
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email');
    if (!group) return res.status(404).json({ message: 'Group nahi mila' });

    const isMember = group.members.some(m => m.user && m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access nahi hai' });

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/groups/:id/members — member add karo (registered or guest)
router.post('/:id/members', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group nahi mila' });
    if (group.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Sirf group creator add kar sakta hai' });

    const { email, guestName } = req.body;

    if (guestName?.trim()) {
      // Add guest member
      group.members.push({ user: null, guestName: guestName.trim() });
      await group.save();
      const updated = await group.populate('members.user', 'name email');
      return res.json(updated);
    }

    if (email?.trim()) {
      const User = require('../models/User');
      const newUser = await User.findOne({ email: email.trim().toLowerCase() });
      if (!newUser) return res.status(404).json({ message: 'User nahi mila is email pe' });

      const alreadyIn = group.members.some(m => m.user && m.user.toString() === newUser._id.toString());
      if (alreadyIn) return res.status(400).json({ message: 'Ye pehle se group mein hai' });

      group.members.push({ user: newUser._id, guestName: '' });
      await group.save();
      const updated = await group.populate('members.user', 'name email');
      return res.json(updated);
    }

    res.status(400).json({ message: 'Email ya guest naam do' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/groups/:id
router.delete('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group nahi mila' });
    if (group.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Sirf creator delete kar sakta hai' });

    await group.deleteOne();
    res.json({ message: 'Group delete ho gaya' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
const express = require('express');
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/settlements/group/:groupId — saare settlements
router.get('/group/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group nahi mila' });

    const isMember = group.members.some(m => m.user && m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access nahi hai' });

    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate('paidBy', 'name email')
      .populate('paidTo', 'name email')
      .sort('-settledAt');

    res.json(settlements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/settlements — naya settlement record karo
router.post('/', async (req, res) => {
  try {
    const { groupId, paidBy, paidByGuest, paidTo, paidToGuest, amount, note } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount sahi do' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group nahi mila' });

    const isMember = group.members.some(m => m.user && m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access nahi hai' });

    const settlement = await Settlement.create({
      group: groupId,
      paidBy: paidBy || null,
      paidByGuest: paidByGuest || '',
      paidTo: paidTo || null,
      paidToGuest: paidToGuest || '',
      amount,
      note: note || '',
    });

    const populated = await settlement.populate([
      { path: 'paidBy', select: 'name email' },
      { path: 'paidTo', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/settlements/:id — settlement undo karo
router.delete('/:id', async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) return res.status(404).json({ message: 'Settlement nahi mila' });

    const group = await Group.findById(settlement.group);
    const isMember = group?.members.some(m => m.user && m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access nahi hai' });

    await settlement.deleteOne();
    res.json({ message: 'Settlement undo ho gaya' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
const express = require('express');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/expenses/group/:groupId
router.get('/group/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group nahi mila' });

    const isMember = group.members.some(m => m.user && m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access nahi hai' });

    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')
      .sort('-date');
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/expenses — naya expense add karo
router.post('/', async (req, res) => {
  try {
    const { groupId, title, amount, paidBy, paidByGuest, splitType, splits, category, notes, date } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group nahi mila' });

    const isMember = group.members.some(m => m.user && m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access nahi hai' });

    let computedSplits = splits;

    if (splitType === 'equal' || !splits) {
      const perPerson = amount / group.members.length;
      computedSplits = group.members.map(m => ({
        user: m.user || null,
        guestName: m.guestName || '',
        amount: perPerson,
      }));
    }

    const expense = await Expense.create({
      group: groupId,
      title,
      amount,
      paidBy: paidBy || (!paidByGuest ? req.user._id : null),
      paidByGuest: paidByGuest || '',
      splitType: splitType || 'equal',
      splits: computedSplits,
      category,
      notes,
      date,
    });

    const populated = await expense.populate([
      { path: 'paidBy', select: 'name email' },
      { path: 'splits.user', select: 'name email' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/expenses/group/:groupId/balances
router.get('/group/:groupId/balances', async (req, res) => {
  try {
    const Settlement = require('../models/Settlement');
    const group = await Group.findById(req.params.groupId).populate('members.user', 'name email');
    if (!group) return res.status(404).json({ message: 'Group nahi mila' });

    const isMember = group.members.some(m => m.user && m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access nahi hai' });

    const expenses = await Expense.find({ group: req.params.groupId });
    const settlements = await Settlement.find({ group: req.params.groupId });

    const getMemberId = (m) => m.user ? m.user._id.toString() : `guest:${m.guestName}`;
    const getMemberDisplay = (m) => m.user
      ? { name: m.user.name, email: m.user.email, isGuest: false }
      : { name: m.guestName, isGuest: true };

    const balances = {};
    group.members.forEach(m => { balances[getMemberId(m)] = 0; });

    // Add expense balances
    expenses.forEach(exp => {
      const payerId = exp.paidBy ? exp.paidBy.toString() : `guest:${exp.paidByGuest}`;
      balances[payerId] = (balances[payerId] || 0) + exp.amount;
      exp.splits.forEach(split => {
        const uid = split.user ? split.user.toString() : `guest:${split.guestName}`;
        balances[uid] = (balances[uid] || 0) - split.amount;
      });
    });

    // Apply settlements — payer gets credit, receiver gets debit
    settlements.forEach(s => {
      const fromId = s.paidBy ? s.paidBy.toString() : `guest:${s.paidByGuest}`;
      const toId = s.paidTo ? s.paidTo.toString() : `guest:${s.paidToGuest}`;
      balances[fromId] = (balances[fromId] || 0) + s.amount;
      balances[toId] = (balances[toId] || 0) - s.amount;
    });

    // Settle up suggestions
    const debtors = [];
    const creditors = [];
    Object.entries(balances).forEach(([id, bal]) => {
      if (bal < -0.01) debtors.push({ id, amount: -bal });
      else if (bal > 0.01) creditors.push({ id, amount: bal });
    });
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let d = 0, c = 0;
    while (d < debtors.length && c < creditors.length) {
      const amt = Math.min(debtors[d].amount, creditors[c].amount);
      transactions.push({ from: debtors[d].id, to: creditors[c].id, amount: Math.round(amt * 100) / 100 });
      debtors[d].amount -= amt;
      creditors[c].amount -= amt;
      if (debtors[d].amount < 0.01) d++;
      if (creditors[c].amount < 0.01) c++;
    }

    const memberMap = {};
    group.members.forEach(m => { memberMap[getMemberId(m)] = getMemberDisplay(m); });

    const result = transactions.map(t => ({
      from: memberMap[t.from] || { name: t.from },
      to: memberMap[t.to] || { name: t.to },
      fromId: t.from,
      toId: t.to,
      amount: t.amount,
    }));

    const balanceList = Object.entries(balances).map(([id, bal]) => ({
      user: memberMap[id] || { name: id },
      balance: Math.round(bal * 100) / 100,
    }));

    res.json({ balances: balanceList, transactions: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense nahi mila' });

    const group = await Group.findById(expense.group);
    const isMember = group?.members.some(m => m.user && m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access nahi hai' });

    await expense.deleteOne();
    res.json({ message: 'Expense delete ho gaya' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
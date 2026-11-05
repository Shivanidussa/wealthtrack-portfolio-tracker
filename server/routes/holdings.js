const express = require('express');
const Holding = require('../models/Holding');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth); // every route below needs login

// Get all holdings of the logged-in user
router.get('/', async (req, res) => {
  const holdings = await Holding.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(holdings);
});

// Add a holding
router.post('/', async (req, res) => {
  try {
    const { type, name, symbol, quantity, buyPrice, buyDate } = req.body;
    const holding = await Holding.create({
      user: req.userId,
      type,
      name,
      symbol,
      quantity,
      buyPrice,
      buyDate,
    });
    res.status(201).json(holding);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a holding
router.put('/:id', async (req, res) => {
  try {
    const holding = await Holding.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!holding) return res.status(404).json({ message: 'Holding not found' });
    res.json(holding);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a holding
router.delete('/:id', async (req, res) => {
  const holding = await Holding.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!holding) return res.status(404).json({ message: 'Holding not found' });
  res.json({ message: 'Holding deleted' });
});

module.exports = router;
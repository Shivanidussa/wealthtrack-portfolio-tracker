const express = require('express');
const Holding = require('../models/Holding');
const auth = require('../middleware/auth');
const {
  getStockPrice,
  getMutualFundNav,
  searchStocks,
  searchMutualFunds,
} = require('../services/priceService');

const router = express.Router();
router.use(auth);

const round2 = (n) => Math.round(n * 100) / 100;

// Search stocks or mutual funds by name
router.get('/search', async (req, res) => {
  const { type, q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  try {
    const results =
      type === 'mutualfund' ? await searchMutualFunds(q) : await searchStocks(q);
    res.json(results);
  } catch (err) {
    res.json([]);
  }
});

// Full portfolio summary with live P&L
router.get('/summary', async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.userId });

    const rows = await Promise.all(
      holdings.map(async (h) => {
        let currentPrice = h.buyPrice;
        let previousClose = h.buyPrice;
        let live = false;

        try {
          const p =
            h.type === 'stock'
              ? await getStockPrice(h.symbol)
              : await getMutualFundNav(h.symbol);
          currentPrice = p.price;
          previousClose = p.previousClose;
          live = true;
        } catch (err) {
          // price source unreachable: fall back to buy price
        }

        const invested = h.quantity * h.buyPrice;
        const currentValue = h.quantity * currentPrice;
        const pnl = currentValue - invested;

        return {
          id: h._id,
          type: h.type,
          name: h.name,
          symbol: h.symbol,
          quantity: h.quantity,
          buyPrice: h.buyPrice,
          buyDate: h.buyDate,
          currentPrice: round2(currentPrice),
          live,
          invested: round2(invested),
          currentValue: round2(currentValue),
          pnl: round2(pnl),
          returnPct: invested ? round2((pnl / invested) * 100) : 0,
          dayChange: round2((currentPrice - previousClose) * h.quantity),
        };
      })
    );

    const totalInvested = rows.reduce((s, r) => s + r.invested, 0);
    const totalValue = rows.reduce((s, r) => s + r.currentValue, 0);
    const totalPnl = totalValue - totalInvested;
    const dayChange = rows.reduce((s, r) => s + r.dayChange, 0);

    rows.forEach((r) => {
      r.allocationPct = totalValue ? round2((r.currentValue / totalValue) * 100) : 0;
    });

    res.json({
      totals: {
        invested: round2(totalInvested),
        currentValue: round2(totalValue),
        pnl: round2(totalPnl),
        returnPct: totalInvested ? round2((totalPnl / totalInvested) * 100) : 0,
        dayChange: round2(dayChange),
        holdingsCount: rows.length,
      },
      holdings: rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
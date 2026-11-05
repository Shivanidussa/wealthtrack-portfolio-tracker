const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['stock', 'mutualfund'], required: true },
    name: { type: String, required: true, trim: true },
    symbol: { type: String, required: true, trim: true }, // e.g. RELIANCE.NS or MF scheme code
    quantity: { type: Number, required: true, min: 0 },
    buyPrice: { type: Number, required: true, min: 0 },
    buyDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Holding', holdingSchema);
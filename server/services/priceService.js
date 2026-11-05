const axios = require('axios');

const cache = new Map();

const getCached = (key) => {
  const hit = cache.get(key);
  return hit && Date.now() < hit.expires ? hit.value : null;
};
const setCached = (key, value, ttlMs) =>
  cache.set(key, { value, expires: Date.now() + ttlMs });

const HEADERS = { 'User-Agent': 'Mozilla/5.0' };

// Live stock price (Yahoo Finance). Indian symbols end with .NS (NSE) or .BO (BSE)
async function getStockPrice(symbol) {
  const key = `stock:${symbol}`;
  const cached = getCached(key);
  if (cached) return cached;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const { data } = await axios.get(url, { headers: HEADERS, timeout: 8000 });
  const meta = data.chart.result[0].meta;

  const value = {
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice,
  };
  setCached(key, value, 60 * 1000); // cache 1 minute
  return value;
}

// Latest mutual fund NAV (mfapi.in). symbol = AMFI scheme code
async function getMutualFundNav(schemeCode) {
  const key = `mf:${schemeCode}`;
  const cached = getCached(key);
  if (cached) return cached;

  const { data } = await axios.get(`https://api.mfapi.in/mf/${schemeCode}`, { timeout: 10000 });
  const latest = parseFloat(data.data[0].nav);
  const previous = data.data[1] ? parseFloat(data.data[1].nav) : latest;

  const value = { price: latest, previousClose: previous };
  setCached(key, value, 10 * 60 * 1000); // NAV changes once a day, cache 10 minutes
  return value;
}

async function searchStocks(q) {
  const { data } = await axios.get('https://query1.finance.yahoo.com/v1/finance/search', {
    params: { q, quotesCount: 10, newsCount: 0 },
    headers: HEADERS,
    timeout: 8000,
  });
  return (data.quotes || [])
    .filter((x) => x.symbol && (x.symbol.endsWith('.NS') || x.symbol.endsWith('.BO')))
    .slice(0, 10)
    .map((x) => ({
      symbol: x.symbol,
      name: x.shortname || x.longname || x.symbol,
      type: 'stock',
    }));
}

async function searchMutualFunds(q) {
  const { data } = await axios.get('https://api.mfapi.in/mf/search', {
    params: { q },
    timeout: 8000,
  });
  return data.slice(0, 10).map((f) => ({
    symbol: String(f.schemeCode),
    name: f.schemeName,
    type: 'mutualfund',
  }));
}

module.exports = { getStockPrice, getMutualFundNav, searchStocks, searchMutualFunds };
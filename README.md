# WealthTrack: Stock and Mutual Fund Portfolio Tracker

A full stack MERN application to track Indian stocks and mutual funds with live prices, automatic profit and loss, and allocation charts.

## Features
- Secure signup and login (JWT authentication, bcrypt password hashing)
- Add, edit and delete stock and mutual fund holdings
- Live stock prices (NSE) and latest mutual fund NAVs
- Automatic calculation of invested amount, current value, P&L, return % and day change
- Allocation donut chart and profit/loss bar chart
- Responsive dark dashboard

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Recharts, React Router, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (Mongoose)
- **Data sources:** Yahoo Finance (stocks), mfapi.in (mutual fund NAV)

## How P&L is calculated
- Invested = quantity × buy price
- Current value = quantity × current price
- P&L = current value − invested
- Return % = P&L ÷ invested × 100

Note: this is gross P&L. Brokerage, taxes and other charges are not included.

## Run locally

### 1. Backend
```
cd server
npm install
```
Create `server/.env` using `server/.env.example` as a guide, then:
```
npm run dev
```

### 2. Frontend
```
cd client
npm install
npm run dev
```
Open http://localhost:5173

## API overview
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in |
| GET | /api/holdings | List holdings |
| POST | /api/holdings | Add holding |
| PUT | /api/holdings/:id | Edit holding |
| DELETE | /api/holdings/:id | Delete holding |
| GET | /api/portfolio/summary | Portfolio with live P&L |
| GET | /api/portfolio/search | Search stocks or funds |
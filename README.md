# Wealth Clicks

A modern investment platform with clicking tasks, referral system, and shared capital packages.

## Features

- User Authentication (Login/Register)
- Daily Clicking Tasks (₱0.20 per click, max ₱10 per day)
- Investment Packages:
  - Package 1: ₱100 investment, 12 days, 20% interest
  - Package 2: ₱500 investment, 20 days, 50% interest
- Multi-level Referral System:
  - Direct referral: 10% of registration fee
  - Investment referrals:
    - Direct (1st level): 5%
    - 2nd level: 2%
    - 3rd level: 2%
    - 4th level: 1%
- Admin Dashboard
- Agent Dashboard

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd wealth-clicks
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```

4. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/wealth-clicks
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Daily Interest Processing

To process daily interest for investments, set up a cron job to run:
```bash
cd server
node scripts/processInterest.js
```

## Admin Account

The default admin account will be created on first run:
- Email: admin@wealthclicks.com
- Password: admin123

## License

[MIT License](LICENSE) 
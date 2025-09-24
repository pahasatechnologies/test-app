# PostgreSQL Setup Instructions

## 1. Database Setup

### Option A: Using psql command line
```bash
# Create database
createdb lottery_db

# Run setup script
psql -d lottery_db -f src/utils/database-setup.sql
```

### Option B: Using PostgreSQL client (pgAdmin, DBeaver, etc.)
1. Create a new database named `lottery_db`
2. Open the `src/utils/database-setup.sql` file
3. Copy and execute all the SQL commands in your database

### Option C: Manual setup
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE lottery_db;

-- Connect to the new database
\c lottery_db

-- Run all the table creation commands from src/utils/database-setup.sql
```

## 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update your database connection details in `.env`:
   ```env
   # Option 1: Connection string
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/lottery_db
   
   # Option 2: Individual parameters (alternative)
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=lottery_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

3. Configure other settings:
   ```env
   # Email settings (for OTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Lottery settings
   DEPOSIT_ADDRESS=your-shared-deposit-address
   ```

## 3. Start the Server

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start production server
npm start

# Or for development with auto-reload
npm run dev
```

# 1. Generate Prisma client
npm run generate

# 2. Apply migrations
npm run dev:migrate

# 3. Run seed
npm run db:seed


## 4. Test the API

The server will start on `http://localhost:3000`

Test endpoints:
- `GET /health` - Health check
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/tickets/info` - Ticket information

## 5. Database Schema Overview

The system creates these tables:
- `users` - User accounts and verification
- `wallets` - User wallet balances and addresses
- `draws` - Lottery draws and winners
- `tickets` - Individual lottery tickets
- `deposits` - Deposit transactions
- `withdrawals` - Withdrawal requests
- `otp_verifications` - Email verification codes

## 6. Important Notes

- All users share the same deposit address (configurable in .env)
- Withdrawals are only available after winner declaration
- Referral system gives 10% of deposits to referrers
- Surprise feature activates after 5 successful deposits
- Winners are selected fairly from different countries/locations
- Draws last 30 days with automatic expiration
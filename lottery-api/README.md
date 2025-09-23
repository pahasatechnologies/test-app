# Lottery System API

A comprehensive lottery system backend built with Node.js, TypeScript, and PostgreSQL.

## Features

### User Management
- ✅ User registration with email OTP verification
- ✅ Secure password hashing and JWT authentication
- ✅ Country-based winner selection
- ✅ Referral system (10% of deposits)

### Wallet System
- ✅ Automatic wallet creation upon signup
- ✅ Shared deposit address for all users
- ✅ Withdrawal system with fees (Deposit - Referral - 10%)
- ✅ Withdrawal activation only after winner declaration

### Lottery System
- ✅ $100 ticket purchasing
- ✅ 30-day draw cycles with countdown timer
- ✅ Three-tier prize system ($2000, $1000, $500)
- ✅ Automatic winner selection from different countries
- ✅ Surprise feature after 5 successful deposits

### Additional Features
- ✅ Comprehensive API documentation
- ✅ Input validation and error handling
- ✅ Email notifications for OTP and welcome messages
- ✅ Draw history tracking
- ✅ User dashboard with ticket management

## Tech Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt password hashing
- **Email**: Nodemailer with SMTP
- **Security**: Helmet, CORS, input validation

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up PostgreSQL database and run the setup script:
   ```bash
   # Create your PostgreSQL database
   createdb lottery_db
   
   # Run the setup script
   psql -d lottery_db -f src/utils/database-setup.sql
   
   # Or connect to your database and run the SQL commands manually
   psql -d lottery_db
   # Then copy and paste the contents of src/utils/database-setup.sql
   ```

5. Build and start the server:
   ```bash
   npm run build
   npm start
   
   # For development:
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/resend-otp` - Resend OTP

### Wallet Management
- `GET /api/wallet` - Get wallet information
- `POST /api/wallet/deposit` - Process deposit
- `POST /api/wallet/withdraw` - Request withdrawal
- `GET /api/wallet/withdrawals` - Get withdrawal history

### Ticket System
- `GET /api/tickets/info` - Get ticket and draw information
- `POST /api/tickets/purchase` - Purchase tickets
- `GET /api/tickets/my-tickets` - Get user's tickets

### Draw Management
- `POST /api/draws/conduct` - Conduct draw (admin/cron)
- `GET /api/draws/history` - Get draw history

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/lottery_db

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Lottery Configuration
TICKET_PRICE=100
FIRST_PRIZE=2000
SECOND_PRIZE=1000
THIRD_PRIZE=500
REFERRAL_PERCENTAGE=10
WITHDRAWAL_FEE_PERCENTAGE=10
DEPOSIT_ADDRESS=your-crypto-deposit-address
DRAW_DURATION_DAYS=30
SURPRISE_DEPOSIT_THRESHOLD=5
```

## Key Features Implementation

### 1. User Registration & Verification
- Email-based signup with OTP verification
- Automatic wallet creation
- Referral code generation

### 2. Deposit & Referral System
- Shared deposit address for all users
- 10% referral earnings on successful deposits
- Deposit counting for surprise feature activation

### 3. Ticket Purchasing
- $100 tickets with unique ticket numbers
- Automatic draw creation if none exists
- Balance validation before purchase

### 4. Winner Selection Algorithm
- Fair selection across different countries/locations
- Three-tier prize distribution
- Automatic prize distribution to wallets

### 5. Withdrawal System
- Formula: Available = Total Deposited - Referral Earnings - 10%
- Only available after draw completion
- Pending approval system

### 6. Security Features
- JWT-based authentication
- Password strength validation
- Input sanitization
- Rate limiting considerations
- Database transaction handling

## Database Schema

The system uses the following main tables:
- `users` - User information and verification status
- `wallets` - User wallet balances and transaction history
- `draws` - Lottery draw information and winners
- `tickets` - Individual ticket records
- `deposits` - Deposit transaction records
- `withdrawals` - Withdrawal requests
- `otp_verifications` - Email verification codes

## Deployment Notes

1. Set up PostgreSQL database with proper indexes
2. Configure email service (SMTP) for OTP delivery
3. Set up scheduled job for automatic draw conduction
4. Configure proper CORS origins for production
5. Use environment variables for all sensitive configuration
6. Implement proper logging and monitoring

## License

MIT License
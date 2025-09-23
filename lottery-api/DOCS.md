# Lottery System API Documentation

A comprehensive lottery system API built with Node.js, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

- User authentication and registration
- Email verification with OTP
- Wallet management with deposits/withdrawals
- Ticket purchasing system
- Automated lottery draws
- Admin dashboard and management
- Referral system
- Real-time balance tracking

## 📚 API Documentation

### Base URL
- Development: `http://localhost:4000`
- Production: `https://api.lottery.com`

### Interactive Documentation
Visit `/api-docs` for interactive Swagger documentation.

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

Authorization: Bearer <your-jwt-token>


## 📋 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/verify-otp` | Verify email with OTP | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/resend-otp` | Resend OTP | No |

### Wallet Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/wallet` | Get wallet info | Yes |
| POST | `/api/wallet/deposit` | Process deposit | Yes |
| POST | `/api/wallet/withdraw` | Request withdrawal | Yes |
| GET | `/api/wallet/withdrawals` | Get withdrawal history | Yes |

### Ticket Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tickets/info` | Get current draw info | No |
| POST | `/api/tickets/purchase` | Purchase tickets | Yes |
| GET | `/api/tickets/my-tickets` | Get user tickets | Yes |

### Draw Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/draws/history` | Get draw history | No |
| POST | `/api/draws/conduct` | Conduct draw (Admin) | No |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/dashboard/stats` | Get dashboard stats | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| GET | `/api/admin/draws` | Get all draws | Admin |
| GET | `/api/admin/withdrawals/pending` | Get pending withdrawals | Admin |
| POST | `/api/admin/withdrawals/process` | Process withdrawal | Admin |
| GET | `/api/admin/config` | Get system config | Admin |
| POST | `/api/admin/users/create-admin` | Create admin user | Admin |

## 🔧 Installation & Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npx prisma migrate dev`
5. Generate Prisma client: `npx prisma generate`
6. Start the server: `npm run dev`

## 📦 Dependencies

- Express.js - Web framework
- Prisma - Database ORM
- PostgreSQL - Database
- JWT - Authentication
- Bcrypt - Password hashing
- Nodemailer - Email sending
- Swagger - API documentation

## 🧪 Testing

Use the provided cURL commands or Postman collection to test the API endpoints.

## 📝 License

MIT License

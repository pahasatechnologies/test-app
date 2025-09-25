import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import walletRoutes from './routes/wallet';
import ticketRoutes from './routes/tickets';
import drawRoutes from './routes/draws';
import adminRoutes from './routes/admin';
import ticketTypeRoutes from './routes/ticketTypes';
import notificationRoutes from './routes/notifications';

import { CONFIG } from './config/constants';
import { setupSwagger } from './config/swagger';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with your frontend domain
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: CONFIG.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ticket-types', ticketTypeRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(CONFIG.NODE_ENV === 'development' && { details: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = CONFIG.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Lottery API server running on port ${PORT}`);
  console.log(`📊 Environment: ${CONFIG.NODE_ENV}`);
  console.log(`🎫 Ticket Price: $${CONFIG.LOTTERY.TICKET_PRICE}`);
  console.log(`⏰ Draw Duration: ${CONFIG.LOTTERY.DRAW_DURATION_DAYS} days`);
});

export default app;
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lottery System API',
      version: '1.0.0',
      description: 'A comprehensive lottery system API with user management, wallet operations, ticket purchases, and draw management.',
      contact: {
        name: 'API Support',
        email: 'support@lottery.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      },
      {
        url: 'https://api.lottery.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            location: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'user'] },
            isEmailVerified: { type: 'boolean' },
            referralCode: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Wallet: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            balance: { type: 'number', format: 'decimal' },
            depositAddress: { type: 'string' },
            totalDeposited: { type: 'number', format: 'decimal' },
            totalWithdrawn: { type: 'number', format: 'decimal' },
            referralEarnings: { type: 'number', format: 'decimal' },
            maxWithdrawalAmount: { type: 'number', format: 'decimal' }
          }
        },
        Ticket: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            ticketNumber: { type: 'string' },
            purchasePrice: { type: 'number', format: 'decimal' },
            status: { type: 'string', enum: ['active', 'expired', 'winner'] },
            purchasedAt: { type: 'string', format: 'date-time' }
          }
        },
        Draw: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'completed', 'cancelled'] },
            totalTickets: { type: 'integer' },
            prizePool: { type: 'number', format: 'decimal' },
            daysRemaining: { type: 'integer' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        SystemConfig: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            key: { type: 'string' },
            value: { type: 'string' },
            type: { type: 'string', enum: ['string', 'number', 'boolean'] },
            category: { type: 'string' },
            isEditable: { type: 'boolean' },
            description: { type: 'string' }
          }
        },
        ConfigUpdate: {
          type: 'object',
          required: [
            'value'
          ],
          properties: {
            value: { type: 'string', description: 'The new value for the configuration key' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration'
      },
      {
        name: 'Wallet',
        description: 'Wallet operations and transactions'
      },
      {
        name: 'Tickets',
        description: 'Ticket purchase and management'
      },
      {
        name: 'Draws',
        description: 'Lottery draw operations'
      },
      {
        name: 'Admin',
        description: 'Administrative operations'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Lottery API Documentation'
  }));
};

export default specs;

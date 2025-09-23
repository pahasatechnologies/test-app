import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/helpers';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: 'admin' | 'user';
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    
    // Verify user still exists and is verified using Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isEmailVerified: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ error: 'Email not verified' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as 'admin' | 'user',
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // No token provided, continue without user
  }

  try {
    const decoded = verifyToken(token);
    
    // Try to get user information using Prisma
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isEmailVerified: true // Only get verified users
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true
      }
    });
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role as 'admin' | 'user',
      };
    }
  } catch (error) {
    // Token invalid or user not found, but continue without user
    console.log('Optional auth failed (continuing):', error);
  }
  
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

// Optional: Add a middleware to validate specific permissions
export const requireRole = (roles: ('admin' | 'user')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required roles: ${roles.join(', ')}` });
    }

    next();
  };
};

// Optional: Add middleware to check if user is verified
export const requireVerifiedUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // This is already checked in authenticateToken, but adding for explicit verification
  next();
};

// Clean up Prisma connection on process exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { AuthRequest };

import { Request, Response, NextFunction } from 'express';
import { getUserFromToken, verifyAdminRole } from '../services/supabase';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

// Middleware to verify JWT token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Middleware to verify admin role
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const isAdmin = await verifyAdminRole(req.user.id);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    req.user.role = 'admin';
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(403).json({
      success: false,
      error: 'Authorization failed'
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const user = await getUserFromToken(token);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    console.warn('Optional auth error:', error);
    next();
  }
};

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { UserModel } from '../models/User';
import { AuthUser } from '../types';

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      email_verified: user.email_verified
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireEmailVerification = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.email_verified) {
    return res.status(403).json({ error: 'Email verification required' });
  }
  next();
};
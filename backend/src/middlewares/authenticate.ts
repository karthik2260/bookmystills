import { Response, NextFunction,RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRole } from '../enums/commonEnums';
import { AuthRequest } from '../types/authRequest';

interface JwtPayload {
  _id: string;
  role: AuthRole;
}

export const authenticateToken: RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;
    req.user = {
      _id: decoded._id.toString(),
      role: decoded.role,
    };
    next();
  } catch (err) {
    // ✅ Return proper 401 with expired flag
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        message: 'Token expired',
        expired: true  // ← this triggers your axios interceptor refresh logic
      });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};
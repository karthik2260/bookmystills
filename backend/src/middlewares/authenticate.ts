import { Response, NextFunction,RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRole } from '../enums/commonEnums';
import { AuthRequest } from '../types/authRequest';

interface JwtPayload {
  _id: string;
  role: AuthRole;
}

export const authenticateToken: RequestHandler  = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {  
  const authHeader = req.headers.authorization;

console.log('AUTH HEADER:', authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new Error('Authentication required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY!
    ) as JwtPayload;

    req.user = {
      _id: decoded._id.toString(),
      role: decoded.role,
    };
   




    next();
  } catch(err) {

    return next(new Error('Invalid or expired token'));
  }
};


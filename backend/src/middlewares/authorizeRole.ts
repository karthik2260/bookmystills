import { Response, NextFunction } from 'express';
import { AuthRole } from '../enums/commonEnums';
import { AuthRequest } from '../types/authRequest';
export const authorizeRole = (...allowedRoles: AuthRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
   
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }


   
    next();
  };
};

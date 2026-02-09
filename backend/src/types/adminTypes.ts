import { Request } from 'express';
import { Types } from 'mongoose';
import { AuthRole } from '../enums/commonEnums';

export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId | string;
    role:AuthRole
    // role?: 'user' | 'vendor' | 'admin';
  };
}

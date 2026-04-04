import { Request } from 'express';
import { Types } from 'mongoose';
import { AuthRole } from '../enums/commonEnums';

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string | Types.ObjectId;
    role: AuthRole;
  };
}

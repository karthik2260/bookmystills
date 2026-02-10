import { Types } from 'mongoose';
import { AuthRole } from '../../enums/commonEnums';
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId | string;
        role: AuthRole;
      };
    }
  }
}

export {};

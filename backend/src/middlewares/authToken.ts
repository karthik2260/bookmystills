import { Response,NextFunction } from "express";
import jwt ,{ JwtPayload } from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/userType";
import { Types } from "mongoose";
import dotenv from 'dotenv'
import HTTP_statusCode from "../enums/httpStatusCode";
import Messages from "../enums/errorMessages";
dotenv.config();
interface userJWTPayload extends JwtPayload{
    _id:string
}


export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(HTTP_statusCode.Unauthorized).json({ message: Messages.AUTHENTICATION_REQUIRED });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY!, (err, decoded) => {
    if (err) {
      res.status(HTTP_statusCode.NoAccess).json({ message: Messages.TOKEN_NOT_VALID });
      return;
    }

    const user = decoded as userJWTPayload;  
     
    if (user && user._id) {
      req.user = {
        _id: new Types.ObjectId(user._id),
        // role: user.role
      };
      next();
    } else {
      res.status(HTTP_statusCode.NoAccess).json({ message: Messages.INVALID_PAYLOAD });
    }
  });
};
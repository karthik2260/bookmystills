import { Request } from "express";
import { AuthRole } from "../enums/commonEnums";
import { ObjectId, Schema, Types } from "mongoose";


export interface AuthRequest  extends Request {
    user ?: {
        _id:string | Types.ObjectId
        role:AuthRole
    }
}
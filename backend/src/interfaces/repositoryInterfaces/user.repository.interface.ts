import { UserDocument } from '../../models/userModel';
import mongoose from 'mongoose';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserDocument | null>;
  create(data: Partial<UserDocument>): Promise<UserDocument>;
  UpdatePassword(userId: mongoose.Types.ObjectId, hashedPassword: string): Promise<boolean>;
  UpdatePasswordAndClearToken(
    userId: mongoose.Types.ObjectId,
    hashedPassword: string,
  ): Promise<boolean>;
  clearResetToken(userId: mongoose.Types.ObjectId): Promise<void>;
  getById(id: string): Promise<UserDocument | null>;
  findByToken(resetPasswordToken: string): Promise<UserDocument | null>;
  update(id: string, data: Partial<UserDocument>): Promise<UserDocument | null>;
}

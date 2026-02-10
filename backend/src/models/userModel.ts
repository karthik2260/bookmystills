import mongoose, { Schema, Document, Model } from 'mongoose';
import { User } from '../interfaces/commonInterfaces';

export interface UserDocument extends User, Document {
  _id: mongoose.Types.ObjectId;
}

export interface UserModel extends Model<UserDocument> {}

const UserSchema = new Schema<UserDocument, UserModel>(
  {
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
    },
    name: { type: String, required: true },
    contactinfo: { type: String },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String },
    isGoogleUser: { type: Boolean, default: false },
    image: { type: String },
    imageUrl: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model<UserDocument, UserModel>('User', UserSchema);

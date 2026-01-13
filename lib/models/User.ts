import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  full_name?: string;
  role: 'admin' | 'user';
  phone?: string;
  address?: string;
  avatar_url?: string;
  is_verified: boolean;
  verification_token?: string;
  verification_token_expires?: Date;
  last_verification_sent_at?: Date;
  refresh_token?: string;
  created_at: Date;
  updated_at: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    full_name: { type: String },
    role: { type: String, enum: ['admin', 'user'], default: 'user', index: true },
    phone: { type: String },
    address: { type: String },
    avatar_url: { type: String },
    is_verified: { type: Boolean, default: false },
    verification_token: { type: String },
    verification_token_expires: { type: Date },
    last_verification_sent_at: { type: Date },
    refresh_token: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

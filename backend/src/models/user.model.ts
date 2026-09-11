import mongoose, { Schema, Document } from 'mongoose';

export enum Role {
  PASSENGER = 'PASSENGER',
  ADMIN = 'ADMIN',
  FLIGHT_MANAGER = 'FLIGHT_MANAGER',
  SUPPORT_AGENT = 'SUPPORT_AGENT'
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: Role;
  name?: string;
  verified: boolean;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(Role), default: Role.PASSENGER },
    name: { type: String },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

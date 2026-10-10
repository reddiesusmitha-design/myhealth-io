import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  mockAbhaId: string;
  preferredLanguage: 'en' | 'te';
  dateOfBirth?: Date;
  gender?: string;
  bloodGroup: string;
  emergencyContact?: string;
  allergies: string[];
  chronicConditions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mockAbhaId: {
      type: String,
      unique: true,
      index: true,
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'te'],
      default: 'en',
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    bloodGroup: {
      type: String,
      default: 'O+',
    },
    emergencyContact: {
      type: String,
      default: '',
    },
    allergies: {
      type: [String],
      default: [],
    },
    chronicConditions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { User as IUser, UserRole } from '../interfaces/user.interface';

export interface IUserModel extends IUser, Document {}

const userSchema: Schema = new Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  isInvited: { type: Boolean, default: false },
  registrationToken: { type: String, required: false }
}, {
  timestamps: true
});

userSchema.pre('save', async function (this: any) {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
});

export default mongoose.model<IUserModel>('User', userSchema);

import { Document, model, ObjectId, Schema } from "mongoose";

interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  idNum: number;
  encryptedPassword: string;
  isAdmin: number;
  city: string;
  street: string;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true, minlength: 2, trim: true },
  lastName: { type: String, required: true, minlength: 2, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  idNum: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
    min: 100000000,
    max: 999999999,
  },
  encryptedPassword: { type: String, required: true },
  isAdmin: { type: Number, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true, minlength: 2 },
});

export const User = model<IUser>("User", UserSchema);

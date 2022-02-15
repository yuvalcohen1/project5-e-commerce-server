import { Document, model, ObjectId, Schema } from "mongoose";

interface ICart extends Document {
  userId: string;
  createdAt: Date;
  isOpen: number;
}

const CartSchema = new Schema<ICart>({
  userId: { type: String, required: true },
  createdAt: { type: Date, required: true, default: new Date() },
  isOpen: { type: Number, required: true },
});

export const Cart = model<ICart>("Cart", CartSchema);

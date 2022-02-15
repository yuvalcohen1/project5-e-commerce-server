import { Document, model, Schema } from "mongoose";

interface IOrder extends Document {
  userId: string;
  cartId: string;
  finalPrice: number;
  cityForShipping: string;
  streetForShipping: string;
  shippingDate: Date;
  orderingDate: Date;
  fourLastDigitsOfPayment: number;
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: true },
  cartId: { type: String, required: true },
  finalPrice: { type: Number, required: true },
  cityForShipping: { type: String, required: true },
  streetForShipping: { type: String, required: true },
  shippingDate: { type: Date, required: true },
  orderingDate: { type: Date, required: true, default: new Date() },
  fourLastDigitsOfPayment: {
    type: Number,
    required: true,
    min: 1000,
    max: 9999,
  },
});

export const Order = model<IOrder>("Order", OrderSchema);

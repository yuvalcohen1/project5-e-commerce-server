import { Document, model, ObjectId, Schema } from "mongoose";
import { ProductModel } from "../models/product.model";

interface ICart_Item extends Document {
  product: string | ProductModel;
  quantity: number;
  cartId: string;
}

const Cart_ItemSchema = new Schema<ICart_Item>({
  product: { type: String, required: true, ref: "Product" },
  quantity: { type: Number, required: true },
  cartId: { type: String, required: true },
});

export const Cart_Item = model<ICart_Item>("Cart_Item", Cart_ItemSchema);

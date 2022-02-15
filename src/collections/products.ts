import { Document, model, ObjectId, Schema } from "mongoose";

interface IProduct extends Document {
  productName: string;
  categoryId: string;
  price: number;
  imgUrl: string;
}

const ProductSchema = new Schema<IProduct>({
  productName: { type: String, required: true },
  categoryId: { type: String, required: true },
  price: { type: Number, required: true },
  imgUrl: { type: String, required: true },
});

export const Product = model<IProduct>("Product", ProductSchema);

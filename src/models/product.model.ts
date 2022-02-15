import { ObjectId } from "mongoose";

export interface ProductModel {
  _id?: ObjectId;
  productName: string;
  categoryId: string;
  price: number;
  imgUrl: string;
}

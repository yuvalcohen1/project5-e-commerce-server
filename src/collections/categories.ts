import { Document, model, ObjectId, Schema } from "mongoose";

interface ICategory extends Document {
  categoryName: string;
}

const CategorySchema = new Schema<ICategory>({
  categoryName: { type: String, required: true },
});

export const Category = model<ICategory>("Category", CategorySchema);

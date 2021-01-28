import { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
}

export const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  }
});

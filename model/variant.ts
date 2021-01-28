import { Document, Schema } from 'mongoose';

export interface IVariant extends Document {
  price?: number;
  value: string;
}

export const variantSchema = new Schema<IVariant>({
  price: {
    type: Number,
    default: null,
    min: 0
  },
  value: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 16
  }
});

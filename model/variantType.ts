import { IVariant, variantSchema } from './variant';
import { Document, Schema } from 'mongoose';

export interface IVariantType extends Document {
  name: string;
  unit?: string;
  variants: IVariant[];
}

export const variantTypeSchema = new Schema<IVariantType>({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  unit: {
    type: String,
    minlength: 1,
    maxlength: 16,
    default: null
  },
  variants: {
    type: [variantSchema],
    validate: {
      validator: (value: IVariant[]) => value.length > 1,
      message: 'At-least 2 {PATH} is required.'
    },
    default: null
  }
});

import { Document, Schema } from 'mongoose';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';

export interface IVariant extends Document {
  price?: number;
  value: string;
  selected: boolean;
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

export const joiVariantSchema: ObjectSchema<IVariant> = Joi.object<IVariant>({
  price: Joi.number().min(0),
  value: Joi.string().min(1).max(16).required()
});

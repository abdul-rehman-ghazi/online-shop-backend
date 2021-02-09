import { IVariant, joiVariantSchema, variantSchema } from './variant';
import { Document, Schema } from 'mongoose';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';
import { IProduct } from './product';
import { cartItemSchema } from './cartItem';

export interface IVariantType extends Document {
  name: string;
  unit?: string;
  variants: IVariant[];
  response: (selectedId: string) => IVariantType;
}

export const variantTypeSchema = new Schema<IVariantType>({
  name: {
    type: String,
    default: 'Default',
    minlength: 3,
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
      validator: (value: IVariant[]) => value.length > 0,
      message: 'At-least 1 {PATH} is required.'
    },
    default: null
  }
});

variantTypeSchema.methods.response = function (selectedId: string) {
  this.variants.find((value: IVariant) => {
    value._id.equals(selectedId);
  })!.selected = true;

  return this;
};

export const joiVariantTypeSchema: ObjectSchema<IVariantType> = Joi.object<IVariantType>(
  {
    name: Joi.string().min(3).max(255),
    unit: Joi.string().min(1).max(16),
    variants: Joi.array().items(joiVariantSchema).min(1).required()
  }
);

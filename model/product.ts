import * as mongoose from 'mongoose';
import { Document, model, Schema } from 'mongoose';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';
import { validationOptions } from '../util/utils';
import { categorySchema, ICategory } from './category';
import {
  IVariantType,
  joiVariantTypeSchema,
  variantTypeSchema
} from './variantType';
import { IReview, reviewSchema } from './review';
import { JoiObjectId } from '../startup/validation';

export interface IProduct extends Document {
  name: string;
  description: string;
  image: string;
  category: ICategory;
  price: number;
  variant: IVariantType;
  relatedProductIds: string[];
  reviews: IReview[];
  averageReview: number;
}
export interface IProductInput {
  name: string;
  description: string;
  image: string;
  categoryId: string;
  variant?: IVariantType;
  relatedProductIds: string[];
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  description: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  image: {
    type: String,
    minlength: 5,
    maxlength: 1024,
    default: 'https://i.stack.imgur.com/y9DpT.jpg'
  },
  category: {
    type: categorySchema,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  variant: {
    type: variantTypeSchema,
    default: null
  },
  relatedProductIds: {
    type: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
      }
    ],
    default: null
  },
  reviews: {
    type: [reviewSchema],
    default: []
  },
  averageReview: {
    type: Number,
    default: null,
    min: 0,
    max: 5.0
  }
});

productSchema.methods.response = function (): Partial<IProduct> {
  return this;
};

export const validateProduct = (productInput: IProductInput) => {
  const schema: ObjectSchema<IProductInput> = Joi.object<IProductInput>({
    name: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(5).max(1024).required(),
    image: Joi.string(),
    categoryId: JoiObjectId().required(),
    variant: joiVariantTypeSchema.required(),
    relatedProductIds: Joi.array().items(JoiObjectId())
  });

  return schema.validate(productInput, validationOptions);
};

export default model<IProduct>('Product', productSchema);

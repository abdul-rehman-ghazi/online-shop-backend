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
  category: string;
  price: number;
  variant: IVariantType;
  relatedProductIds: string[];
  reviews: IReview[];
  averageReview: number;
  sellerId: string;
}

export interface IProductInput {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  variant?: IVariantType;
  relatedProductIds: string[];
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255
    },
    description: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 1024
    },
    image: {
      type: String,
      minlength: 3,
      maxlength: 1024,
      default: 'https://i.stack.imgur.com/y9DpT.jpg'
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
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
    relatedProductIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    reviews: {
      type: [reviewSchema],
      default: []
    },
    averageReview: {
      type: Number,
      default: null,
      min: 0,
      max: 5.0
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

productSchema.methods.response = function (): Partial<IProduct> {
  return this;
};

export const validateProduct = (
  productInput: IProductInput,
  isNew: boolean = false
) => {
  let schema = Joi.object<IProductInput>({
    name: Joi.string().min(3).max(255),
    description: Joi.string().min(3).max(1024),
    price: Joi.number().min(0),
    image: Joi.string(),
    category: JoiObjectId(),
    variant: joiVariantTypeSchema.allow(null),
    relatedProductIds: Joi.array().items(JoiObjectId())
  });

  if (isNew) {
    schema = Joi.object<IProductInput>({
      name: Joi.string().min(3).max(255).required(),
      description: Joi.string().min(3).max(1024).required(),
      price: Joi.number().min(0).required(),
      image: Joi.string(),
      category: JoiObjectId().required(),
      variant: joiVariantTypeSchema.allow(null),
      relatedProductIds: Joi.array().items(JoiObjectId())
    });
  }

  return schema.validate(productInput, validationOptions);
};

export default model<IProduct>('Product', productSchema);

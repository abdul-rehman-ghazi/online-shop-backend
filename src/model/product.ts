import * as mongoose from 'mongoose';
import { model, Schema } from 'mongoose';
import * as Joi from 'joi';
import { validationOptions } from '../helpers/utils';
import {
  IVariantType,
  joiVariantTypeSchema,
  variantTypeSchema
} from './variantType';
import { IReview, reviewSchema } from './review';
import { JoiObjectId } from '../startup/validation';
import mongoose_delete, { SoftDeleteDocument } from 'mongoose-delete';

export interface IProduct extends SoftDeleteDocument {
  name: string;
  description: string;
  image: string;
  category: string;
  variant: IVariantType;
  relatedProductIds: string[];
  reviews: IReview[];
  averageReview: number;
  sellerId: string;
  response: () => Partial<IProduct>;
}

export interface IProductInput {
  name: string;
  description: string;
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
    variant: {
      type: variantTypeSchema,
      required: true
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

productSchema.plugin(mongoose_delete, { deletedAt: true });

export const validateProduct = (
  productInput: IProductInput,
  isNew: boolean = false
) => {
  let schema = Joi.object<IProductInput>({
    name: Joi.string().min(3).max(255),
    description: Joi.string().min(3).max(1024),
    image: Joi.string(),
    category: JoiObjectId(),
    variant: joiVariantTypeSchema,
    relatedProductIds: Joi.array().items(JoiObjectId())
  });

  if (isNew) {
    schema = Joi.object<IProductInput>({
      name: Joi.string().min(3).max(255).required(),
      description: Joi.string().min(3).max(1024).required(),
      image: Joi.string(),
      category: JoiObjectId().required(),
      variant: joiVariantTypeSchema.required(),
      relatedProductIds: Joi.array().items(JoiObjectId())
    });
  }

  return schema.validate(productInput, validationOptions);
};

export default model<IProduct>('Product', productSchema);

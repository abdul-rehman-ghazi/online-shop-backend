import { Document, model, Schema } from 'mongoose';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';
import jwt from 'jsonwebtoken';
import config from 'config';
import EGender from './enum/EGender';
import ERole from './enum/ERole';
import { validationOptions } from '../util/utils';
import * as _ from 'lodash';
import { categorySchema, ICategory } from './category';
import { IVariantType, variantTypeSchema } from './variantType';
import { IReview } from './review';

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
    default:
      'https://www.dlf.pt/dfpng/middlepng/248-2480658_profile-icon-png-image-free-download-searchpng-profile.png'
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
  relatedProductIds: [
    {
      type: ObjectId,
      enum: Object.values(ERole),
      default: ERole.CUSTOMER
    }
  ],

  gender: {
    type: EGender,
    enum: Object.values(EGender),
    required: true
  }
});

productSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    { _id: this._id, role: this.role, status: this.status },
    config.get('jwtPrivateKey')
  );
};

productSchema.methods.response = function (): Partial<IProduct> {
  return _.pick<IProduct>(this, [
    'accessToken',
    '_id',
    'name',
    'email',
    'phone',
    'image',
    'gender',
    'status',
    'role'
  ]);
};

export const validateUser = (userInput: IProductInput) => {
  const schema: ObjectSchema<IProductInput> = Joi.object<IProductInput>({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    phone: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(5).max(1024).required(),
    image: Joi.string().min(5).max(255),
    gender: Joi.string()
      .valid(...Object.values(EGender))
      .required()
  });

  return schema.validate(userInput, validationOptions);
};

export default model<IProduct>('User', productSchema);

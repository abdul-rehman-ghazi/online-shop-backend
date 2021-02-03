import { Document, model, Schema } from 'mongoose';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';
import jwt from 'jsonwebtoken';
import config from 'config';
import EStatus from './enum/EStatus';
import EGender from './enum/EGender';
import ERole from './enum/ERole';
import { validationOptions } from '../util/utils';
import * as _ from 'lodash';
import { cartItemSchema, ICartItem } from './cartItem';
import CartItem from './cartItem';

export interface IUser extends Document {
  accessToken: string;
  name: string;
  status: EStatus;
  email: string;
  phone: string;
  password: string;
  generateAuthToken: () => string;
  role: ERole;
  image: string;
  gender: EGender;
  addresses: any[];
  cart: ICartItem[];
  orders: any[];
  response: () => Partial<IUser>;
}

export interface IUserInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  image: string;
  gender: EGender;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255
    },
    status: {
      type: EStatus,
      enum: Object.values(EStatus),
      default: EStatus.ACTIVE
    },
    email: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
      unique: true
    },
    phone: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255
    },
    password: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 1024
    },
    role: {
      type: ERole,
      enum: Object.values(ERole),
      default: ERole.CUSTOMER
    },
    image: {
      type: String,
      minlength: 3,
      maxlength: 1024,
      default:
        'https://www.dlf.pt/dfpng/middlepng/248-2480658_profile-icon-png-image-free-download-searchpng-profile.png'
    },
    gender: {
      type: EGender,
      enum: Object.values(EGender),
      required: true
    },
    cart: {
      type: [cartItemSchema],
      default: []
    }
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    { _id: this._id, role: this.role, status: this.status },
    config.get('jwtPrivateKey')
  );
};

userSchema.methods.response = function (): Partial<IUser> {
  return _.pick<IUser>(this, [
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

export const validateUser = (userInput: IUserInput) => {
  const schema: ObjectSchema<IUserInput> = Joi.object<IUserInput>({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(3).max(255).required().email(),
    phone: Joi.string().min(3).max(255).required(),
    password: Joi.string().min(3).max(1024).required(),
    image: Joi.string().min(3).max(255),
    gender: Joi.string()
      .valid(...Object.values(EGender))
      .required()
  });

  return schema.validate(userInput, validationOptions);
};

export default model<IUser>('User', userSchema);

import { Document, Model, model, Schema } from 'mongoose';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';
import jwt from 'jsonwebtoken';
import config from 'config';
import EStatus from './enum/EStatus';
import EGender from './enum/EGender';
import ERole from './enum/ERole';
import { validationOptions } from '../helpers/utils';
import * as _ from 'lodash';
import { cartItemSchema, ICartItem, ICartItemResponse } from './cartItem';
import { addressSchema, IAddress } from './address';
import mongoose_delete from 'mongoose-delete';

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
  addresses: IAddress[];
  cart: ICartItem[];
  response: () => Partial<IUser>;
}

export interface IUserModel extends Model<IUser> {
  getCarts: (id: string) => Promise<ICartItemResponse[]>;
  getAddress: (id: string, addressId: string) => Promise<IAddress>;
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
    },
    addresses: {
      type: [addressSchema],
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

userSchema.statics.getCarts = async function (id: string) {
  const user = await this.findById(id).select('cart').populate('cart.item');
  const response: ICartItemResponse[] = [];
  user?.cart.forEach((value: ICartItem) => {
    response.push(value.response());
  });
  return response;
};

userSchema.statics.getAddress = async function (id: string, addressId: string) {
  const user = await this.findById(id).select('addresses');
  return user.addresses.find((value: IAddress) => value._id.equals(addressId));
};

userSchema.plugin(mongoose_delete, { deletedAt: true });

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
const userModel: IUserModel = model<IUser, IUserModel>('User', userSchema);

export default userModel;

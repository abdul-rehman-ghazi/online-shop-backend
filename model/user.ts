import { model, Schema, Document } from 'mongoose';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';
import jwt from 'jsonwebtoken';
import config from 'config';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  generateAuthToken: () => string;
  role: string;
  image: string;
  gender: string;
  addresses: any[];
  cart: any[];
  orders: any[];
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  role: {
    type: String,
    enum: ['admin', 'customer', 'seller'],
    default: 'customer'
  },
  image: {
    type: String,
    minlength: 5,
    maxlength: 1024,
    default:
      'https://www.dlf.pt/dfpng/middlepng/248-2480658_profile-icon-png-image-free-download-searchpng-profile.png'
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  }
});

userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    { _id: this._id, role: this.role },
    config.get('jwtPrivateKey')
  );
};

export const validateUser = (user: IUser) => {
  const schema: ObjectSchema<IUser> = Joi.object<IUser>({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required()
  });

  return schema.validate(user);
};

export default model<IUser>('User', userSchema);

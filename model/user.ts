import { model, Schema, Document } from 'mongoose';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';
import jwt from 'jsonwebtoken';
import config from 'config';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  generateAuthToken: () => string;
  isAdmin: boolean;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
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
  isAdmin: {
    type: Boolean,
    default: false
  }
});

userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
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

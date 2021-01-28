import { Document, Schema } from 'mongoose';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';
import { validationOptions } from '../util/utils';

export interface ICategory extends Document {
  name: string;
  description: string;
}

export const categorySchema = new Schema<ICategory>({
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
  }
});

export const validateCategory = (category: ICategory) => {
  const schema: ObjectSchema<ICategory> = Joi.object<ICategory>({
    name: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(5).max(1024).required()
  });

  return schema.validate(category, validationOptions);
};

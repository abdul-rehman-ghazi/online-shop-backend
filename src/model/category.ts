import { Document, model, Schema } from 'mongoose';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';
import { validationOptions } from '../helpers/utils';

export interface ICategory extends Document {
  name: string;
  description: string;
}

export const categorySchema = new Schema<ICategory>(
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
    }
  },
  { timestamps: true }
);

export const validateCategory = (category: ICategory) => {
  const schema: ObjectSchema<ICategory> = Joi.object<ICategory>({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().min(3).max(1024).required()
  });

  return schema.validate(category, validationOptions);
};

export default model<ICategory>('Category', categorySchema);

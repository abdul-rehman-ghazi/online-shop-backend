import { model, Schema } from 'mongoose';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';
import { validationOptions } from '../helpers/utils';
import mongoose_delete, { SoftDeleteDocument } from 'mongoose-delete';

export interface ICategory extends SoftDeleteDocument {
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

categorySchema.plugin(mongoose_delete, { deletedAt: true });

export const validateCategory = (category: ICategory) => {
  const schema: ObjectSchema<ICategory> = Joi.object<ICategory>({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().min(3).max(1024).required()
  });

  return schema.validate(category, validationOptions);
};

export default model<ICategory>('Category', categorySchema);

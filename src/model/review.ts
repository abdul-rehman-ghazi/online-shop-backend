import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import Joi from 'joi';
import { JoiObjectId } from '../startup/validation';

export interface IReview extends Document {
  userId: string;
  rating: number;
  text: string;
}

export const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5.0
    },
    text: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 1024
    }
  },
  { timestamps: true }
);

export const validateReview = (review: IReview) => {
  const schema: Joi.ObjectSchema<IReview> = Joi.object<IReview>({
    userId: JoiObjectId().required(),
    rating: Joi.number().min(0).max(5.0).required(),
    text: Joi.string().min(3).max(1024).required()
  });

  return schema.validate(review);
};

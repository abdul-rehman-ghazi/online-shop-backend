import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

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

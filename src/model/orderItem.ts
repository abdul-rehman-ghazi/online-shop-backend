import { Schema } from 'mongoose';
import * as Joi from 'joi';

export interface IOrderItem {
  name: string;
  price: number;
  quantity: number;
}

export const orderItemSchema = new Schema<IOrderItem>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export const orderItemJoiSchema = Joi.object<IOrderItem>({
  name: Joi.string().min(3).max(255).required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().required()
});

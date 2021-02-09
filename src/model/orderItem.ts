import mongoose, { Schema } from 'mongoose';
import * as Joi from 'joi';

export interface IOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export const orderItemSchema = new Schema<IOrderItem>({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
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
});

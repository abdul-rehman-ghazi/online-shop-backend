import { Schema } from 'mongoose';
import * as Joi from 'joi';
import EOrderStatus from './enum/EOrderStatus';

export interface IOrderStatus {
  status: EOrderStatus;
  date?: Date;
}

export const orderStatusSchema = new Schema<IOrderStatus>({
  status: {
    type: String,
    enum: EOrderStatus,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

export const orderStatusJoiSchema = Joi.object<IOrderStatus>({
  status: Joi.string()
    .valid(...Object.values(EOrderStatus))
    .required(),
  date: Joi.date().default(Date.now()).required()
});

import { Schema } from 'mongoose';
import * as Joi from 'joi';
import EOrderStatus from './enum/EOrderStatus';
import EGender from './enum/EGender';

export interface IOrderStatus {
  status: EOrderStatus;
  date: Date;
}

export const orderStatusSchema = new Schema<IOrderStatus>(
  {
    status: {
      type: String,
      enum: EOrderStatus,
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now()
    }
  },
  { timestamps: true }
);

export const orderStatusJoiSchema = Joi.object<IOrderStatus>({
  status: Joi.string()
    .valid(...Object.values(EOrderStatus))
    .required(),
  date: Joi.date().default(Date.now()).required()
});

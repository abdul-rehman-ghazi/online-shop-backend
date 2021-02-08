import * as mongoose from 'mongoose';
import { model, Schema } from 'mongoose';
import * as Joi from 'joi';
import { validationOptions } from '../helpers/utils';
import mongoose_delete, { SoftDeleteDocument } from 'mongoose-delete';
import EOrderStatus from './enum/EOrderStatus';
import EOrderType from './enum/EOrderType';
import EPaymentType from './enum/EPaymentType';
import { IOrderItem, orderItemSchema } from './orderItem';
import { IOrderStatus, orderStatusSchema } from './orderStatus';
import { addressJoiSchema, addressSchema, IAddress } from './address';

export interface IOrder extends SoftDeleteDocument {
  userId: string;
  items: IOrderItem[];
  statuses: IOrderStatus[];
  subtotal: number;
  type: EOrderType;
  deliveryAddress: IAddress;
  deliveryCharges: number;
  paymentMethod: EPaymentType;
  total: number;
  receivedBy: string;
  response: () => Partial<IOrder>;
}

export interface IOrderInput {
  type: EOrderType;
  deliveryAddress: IAddress;
  paymentMethod: EPaymentType;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    statuses: {
      type: [orderStatusSchema],
      validate: {
        validator: (value: IOrderStatus[]) => value.length > 0,
        message: 'At-least 1 {PATH} is required.'
      }
    },
    subtotal: {
      type: Number,
      min: 0,
      required: true
    },
    type: {
      type: String,
      enum: EOrderType,
      required: true
    },
    deliveryAddress: {
      type: addressSchema,
      required: true
    },
    deliveryCharges: {
      type: Number,
      min: 0,
      default: null
    },
    paymentMethod: {
      type: String,
      enum: EPaymentType,
      required: true
    },
    total: {
      type: Number,
      min: 0,
      required: true
    },
    receivedBy: {
      type: String,
      default: null,
      minlength: 3,
      maxlength: 255
    }
  },
  { timestamps: true }
);

orderSchema.methods.response = function (): Partial<IOrder> {
  return this;
};

orderSchema.plugin(mongoose_delete, { deletedAt: true });

export const validateOrder = (orderInput: IOrderInput) => {
  const schema = Joi.object<IOrderInput>({
    type: Joi.string()
      .valid(...Object.values(EOrderType))
      .required(),
    deliveryAddress: addressJoiSchema,
    paymentMethod: Joi.string()
      .valid(...Object.values(EPaymentType))
      .required()
  });

  return schema.validate(orderInput, validationOptions);
};

export default model<IOrder>('Order', orderSchema);

import * as mongoose from 'mongoose';
import { Model, model, Schema } from 'mongoose';
import * as Joi from 'joi';
import { validationOptions } from '../helpers/utils';
import mongoose_delete, { SoftDeleteDocument } from 'mongoose-delete';
import EOrderType from './enum/EOrderType';
import EPaymentType from './enum/EPaymentType';
import { IOrderItem, orderItemSchema } from './orderItem';
import { IOrderStatus, orderStatusSchema } from './orderStatus';
import { addressSchema, IAddress } from './address';
import User from '../model/user';
import { JoiObjectId } from '../startup/validation';
import { ICartItemResponse } from './cartItem';
import EOrderStatus from './enum/EOrderStatus';

export interface IOrder extends SoftDeleteDocument {
  userId: string;
  items: IOrderItem[];
  statuses: IOrderStatus[];
  subtotal: number;
  type: EOrderType;
  deliveryAddress?: IAddress;
  deliveryCharges: number;
  paymentMethod: EPaymentType;
  total: number;
  receivedBy?: string;
  response: () => Partial<IOrder>;
}

export interface IOrderInput {
  type: EOrderType;
  deliveryAddress: string;
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
      default: null
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

export const toOrder = async (orderInput: IOrderInput, userId: string) => {
  const carts: ICartItemResponse[] = await User.getCarts(userId);
  const items: IOrderItem[] = [];
  let subtotal = 0;
  const statuses = [{ status: EOrderStatus.PENDING }];
  carts.forEach((cartItem: ICartItemResponse) => {
    const orderItem: IOrderItem = {
      itemId: cartItem.itemId,
      name: `${cartItem.name} - ${
        cartItem.variant.variants.find((value1) => value1.selected)?.value
      }`,
      price: cartItem.price,
      quantity: cartItem.quantity
    };
    items.push(orderItem);
    subtotal += orderItem.price;
  });
  let deliveryCharges = 0;
  let deliveryAddress = undefined;
  if (orderInput.type == EOrderType.DELIVERY) {
    deliveryAddress = await User.getAddress(userId, orderInput.deliveryAddress);
    if (!deliveryAddress) throw new Error('Invalid delivery address');
    // todo: get delivery charges from settings
    deliveryCharges = 10;
  }
  const total = subtotal + deliveryCharges;

  return new Order({
    userId: userId,
    items: items,
    statuses: statuses,
    subtotal: subtotal,
    type: orderInput.type,
    deliveryAddress: deliveryAddress,
    deliveryCharges: deliveryCharges,
    paymentMethod: orderInput.paymentMethod,
    total: total
  });
};

orderSchema.plugin(mongoose_delete, { deletedAt: true });

export const validateOrder = (orderInput: IOrderInput) => {
  const schema = Joi.object<IOrderInput>({
    type: Joi.string()
      .valid(...Object.values(EOrderType))
      .required(),
    deliveryAddress: Joi.when('type', {
      is: EOrderType.DELIVERY,
      then: JoiObjectId().required()
    }),
    paymentMethod: Joi.string()
      .valid(...Object.values(EPaymentType))
      .required()
  });

  return schema.validate(orderInput, validationOptions);
};

const Order: Model<IOrder> = model<IOrder>('Order', orderSchema);

export default Order;

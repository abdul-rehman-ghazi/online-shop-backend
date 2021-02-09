import * as mongoose from 'mongoose';
import { HookNextFunction, model, Schema } from 'mongoose';
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

export interface IOrder extends SoftDeleteDocument {
  userId: string;
  items: IOrderItem[];
  statuses: IOrderStatus[];
  subtotal: number;
  type: EOrderType;
  deliveryAddress: IAddress | string;
  deliveryCharges: number;
  paymentMethod: EPaymentType;
  total: number;
  receivedBy: string;
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

orderSchema.pre<IOrder>('save', async function (next: HookNextFunction) {
  const carts: ICartItemResponse[] = await User.getCarts(this.userId);
  this.items = [];
  this.subtotal = 0;
  carts.forEach((cartItem: ICartItemResponse) => {
    const orderItem: IOrderItem = {
      name: `${cartItem.name} - ${
        cartItem.variant.variants.find((value1) => value1.selected)?.value
      }`,
      price: cartItem.price,
      quantity: cartItem.quantity
    };
    this.items.push(orderItem);
    this.subtotal += orderItem.price;
  });
  this.deliveryCharges = 0;
  if (this.type == EOrderType.DELIVERY) {
    this.deliveryAddress = await User.getAddress(
      this.userId,
      this.deliveryAddress as string
    );
    if (!this.deliveryAddress) next(new Error('Invalid delivery address'));
    // todo: get delivery charges from settings
    this.deliveryCharges = 10;
  }
  this.total = this.subtotal + this.deliveryCharges;

  next();
});

orderSchema.plugin(mongoose_delete, { deletedAt: true });

export const validateOrder = (orderInput: IOrderInput) => {
  const schema = Joi.object<IOrderInput>({
    type: Joi.string()
      .valid(...Object.values(EOrderType))
      .required(),
    deliveryAddress: Joi.alternatives().conditional('type', {
      is: EOrderType.DELIVERY,
      then: JoiObjectId().required()
    }),
    paymentMethod: Joi.string()
      .valid(...Object.values(EPaymentType))
      .required()
  });

  return schema.validate(orderInput, validationOptions);
};

export default model<IOrder>('Order', orderSchema);

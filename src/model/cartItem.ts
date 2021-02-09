import * as mongoose from 'mongoose';
import { Document, model, Schema, Types } from 'mongoose';
import * as Joi from 'joi';
import { validationOptions } from '../helpers/utils';
import { JoiObjectId } from '../startup/validation';
import { IProduct } from './product';
import { IVariant } from './variant';
import { IVariantType } from './variantType';

export interface ICartItemResponse {
  _id: string;
  itemId: string;
  name: string;
  image: string;
  price: number;
  variant: IVariantType;
  quantity: number;
}

export interface ICartItem extends Document {
  item: Types.ObjectId | IProduct;
  variantId: string;
  quantity: number;
  response: () => ICartItemResponse;
}

export const cartItemSchema = new Schema<ICartItem>(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product.variant.variants',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

cartItemSchema.index({ item: 1, variantId: 1 }, { unique: true });

cartItemSchema.methods.response = function () {
  const item = this.item as IProduct;

  let price: number =
    item.variant.variants.find((value: IVariant) => {
      value._id.equals(this.variantId);
    })?.price ?? 0; // selected variant price / unit price

  price = price * this.quantity; // total price

  return {
    _id: this._id,
    itemId: item._id,
    name: item.name,
    image: item.image,
    price: price,
    variant: item.variant.response(this.variantId),
    quantity: this.quantity
  };
};

export const validateCartItem = (cartItem: ICartItem) => {
  let schema = Joi.object<ICartItem>({
    item: JoiObjectId().required(),
    variantId: JoiObjectId().required(),
    quantity: Joi.number().min(0).required()
  });

  return schema.validate(cartItem, validationOptions);
};

export default model<ICartItem>('CartItem', cartItemSchema);

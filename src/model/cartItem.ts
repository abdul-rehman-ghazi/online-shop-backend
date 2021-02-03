import * as mongoose from 'mongoose';
import { Document, model, Schema, Types } from 'mongoose';
import * as Joi from 'joi';
import { validationOptions } from '../util/utils';
import { JoiObjectId } from '../startup/validation';
import { IProduct } from './product';
import { IVariant } from './variant';

export interface ICartItem extends Document {
  item: Types.ObjectId | IProduct;
  variantId: string;
  quantity: number;
  response: () => any;
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

  let price: number = 0;
  item.variant.variants.forEach((value: IVariant) => {
    if (value._id.equals(this.variantId)) price += value.price;
  });

  price = price * this.quantity;

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

import * as mongoose from 'mongoose';
import { Document, model, Schema, Types } from 'mongoose';
import * as Joi from 'joi';
import { validationOptions } from '../util/utils';
import { JoiObjectId } from '../startup/validation';
import { IProduct } from './product';
import { IVariantType } from './variantType';

export interface ICartItem extends Document {
  item: Types.ObjectId | IProduct;
  variantId: string;
  quantity: number;
  response: () => any;
}

export interface CartItemResponse {
  name: string;
  image: string;
  price: number;
  variant: IVariantType;
  quantity: number;
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

cartItemSchema.methods.response = function () {
  const item = this.item as IProduct;
  return {
    name: item.name,
    image: item.image,
    price: item.price,
    variant: item.variant?.setSelected(this.variantId),
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

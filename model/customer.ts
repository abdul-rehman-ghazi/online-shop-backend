import { Document, model, Schema } from 'mongoose';
import Joi from 'joi';

export interface ICustomer extends Document {
  name: string;
  isGold: boolean;
  phone: string;
}

const customerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  isGold: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    minlength: 5,
    maxlength: 12,
    default: null
  }
});

export const validateCustomer = (customer: ICustomer) => {
  const schema = Joi.object<ICustomer>({
    name: Joi.string().required().min(5).max(50),
    isGold: Joi.boolean().default(false),
    phone: Joi.string().min(5).max(12)
  });

  return schema.validate(customer);
};

export default model<ICustomer>('Customer', customerSchema);

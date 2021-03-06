import { Document, model, Schema } from 'mongoose';
import * as Joi from 'joi';
import { validationOptions } from '../helpers/utils';

export interface IAddress extends Document {
  label: string;
  text: string;
  latitude: number;
  longitude: number;
  note: string;
}

export const addressSchema = new Schema<IAddress>(
  {
    label: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255
    },
    text: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 1024
    },
    latitude: {
      type: Number,
      required: true,
      min: -90.0,
      max: 90.0
    },
    longitude: {
      type: Number,
      required: true,
      min: -180.0,
      max: 180.0
    },
    note: {
      type: String,
      minlength: 3,
      maxlength: 1024,
      default: null
    }
  },
  { timestamps: true }
);

export const addressJoiSchema = Joi.object<IAddress>({
  label: Joi.string().min(3).max(255).required(),
  text: Joi.string().min(3).max(1024).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  note: Joi.string().min(3).max(1024)
});

export const validateAddress = (address: IAddress) => {
  return addressJoiSchema.validate(address, validationOptions);
};

export default model<IAddress>('Address', addressSchema);

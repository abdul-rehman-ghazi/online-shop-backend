import mongoose, { Document, Schema } from 'mongoose';
import Joi, { ObjectSchema } from 'joi';
import { ICustomer } from './customer';
import { IMovie } from './movie';
import { JoiObjectId } from '../startup/validation';

export interface IRental extends Document {
  customer: ICustomer;
  movie: IMovie;
  dateOut: Date;
  dateReturned: Date;
  rentalFee: number;
}

export interface IRentalInput extends Document {
  customerId: string;
  movieId: string;
}

const rentalSchema = new Schema<IRental>({
  customer: {
    type: new mongoose.Schema<ICustomer>({
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
        required: true,
        minlength: 5,
        maxlength: 50
      }
    }),
    required: true
  },
  movie: {
    type: new Schema<IMovie>({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255
      }
    }),
    required: true
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateReturned: {
    type: Date
  },
  rentalFee: {
    type: Number,
    min: 0
  }
});

export const validateRental = (rentalInput: IRentalInput) => {
  const schema: ObjectSchema<IRentalInput> = Joi.object<IRentalInput>({
    customerId: JoiObjectId().required(),
    movieId: JoiObjectId().required()
  });

  return schema.validate(rentalInput);
};

export default mongoose.model<IRental>('Rental', rentalSchema);

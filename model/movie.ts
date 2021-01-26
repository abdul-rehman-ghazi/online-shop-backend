import { Document, model, Schema } from 'mongoose';
import Joi from 'joi';
import { genreSchema, IGenre } from './genre';
import { JoiObjectId } from '../startup/validation';

export interface IMovie extends Document {
  title: string;
  genre: IGenre;
  numberInStock: number;
  dailyRentalRate: number;
}

export interface IMovieInput {
  title: string;
  genreId: string;
  numberInStock: number;
  dailyRentalRate: number;
}

const movieSchema = new Schema<IMovie>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 255
  },
  genre: {
    type: genreSchema,
    required: true
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  }
});

export const validateMovie = (movieInput: IMovieInput) => {
  const schema = Joi.object<IMovieInput>({
    title: Joi.string().required().min(5).max(50),
    genreId: JoiObjectId().required(),
    numberInStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).max(255).required()
  });

  return schema.validate(movieInput);
};

export default model<IMovie>('Movie', movieSchema);

import { model, Schema, Document } from 'mongoose';
import * as Joi from 'joi';

export interface IGenre extends Document {
  name: string;
}

export const genreSchema = new Schema<IGenre>({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  }
});

export const validateGenre = (genre: IGenre) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required()
  });

  return schema.validate(genre, { allowUnknown: true });
};

export default model<IGenre>('Genre', genreSchema);

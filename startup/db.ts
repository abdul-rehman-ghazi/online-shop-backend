import mongoose from 'mongoose';
import winston from 'winston';

export default () => {
  mongoose
    .connect('mongodb://localhost/e-pos', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    .then(() => winston.info('Database connected'));
};

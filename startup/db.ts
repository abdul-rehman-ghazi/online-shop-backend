import mongoose from 'mongoose';
import winston from 'winston';

export default () => {
  mongoose
    .connect('mongodb://localhost/practice', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    .then(() => winston.info('Database connected'));
};

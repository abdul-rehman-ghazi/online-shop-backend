import express, { Express } from 'express';
import genres from '../routes/genres';
import customers from '../routes/customers';
import movies from '../routes/movies';
import users from '../routes/users';
import auth from '../routes/auth';
import rentals from '../routes/rentals';
import { error } from '../middleware/error';

export default (app: Express) => {
  app.use(express.json());
  app.use('/api/genres', genres);
  app.use('/api/customers', customers);
  app.use('/api/movies', movies);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/rentals', rentals);
  app.use(error);
};

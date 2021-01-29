import express, { Express } from 'express';
import users from '../routes/users';
import auth from '../routes/auth';
import { error } from '../middleware/error';
import bodyParser from 'body-parser';
import categories from '../routes/categories';
import products from '../routes/products';

export default (app: Express) => {
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/api/user', users);
  app.use('/api/auth', auth);
  app.use('/api/category', categories);
  app.use('/api/product', products);
  app.use(error);
};

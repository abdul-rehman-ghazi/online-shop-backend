import express, { Express } from 'express';
import users from '../routes/users';
import auth from '../routes/auth';
import { error } from '../middleware/error';
import bodyParser from 'body-parser';

export default (app: Express) => {
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use(error);
};

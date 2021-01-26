import config from 'config';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { IUser } from '../model/user';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    req.body.user = jwt.verify(token, config.get('jwtPrivateKey')) as IUser;
    next();
  } catch (e) {
    res.status(400).send('Invalid Token');
  }
};

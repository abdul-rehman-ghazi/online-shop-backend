import config from 'config';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { IUser } from '../model/user';

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.user.isAdmin) return res.status(403).send('Access denied.');

  next();
};

import config from 'config';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { IUser } from '../model/user';
import { baseErrorResponse } from '../type/BaseResponse';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader: string | undefined = req.header('Authorization');
  if (!authHeader)
    return res
      .status(401)
      .send(baseErrorResponse('Access denied. No token provided.'));
  const accessToken: string = authHeader.replace('Bearer ', '');

  try {
    req.body.user = jwt.verify(
      accessToken,
      config.get('jwtPrivateKey')
    ) as IUser;
    next();
  } catch (e) {
    res.status(400).send(baseErrorResponse('Invalid Token'));
  }
};

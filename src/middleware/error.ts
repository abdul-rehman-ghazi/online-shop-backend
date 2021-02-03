import { NextFunction, Request, Response } from 'express';
import winston from 'winston';

export const error = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  winston.error(error.message, error);
  res.status(500).send('Something failed.');
};

import { NextFunction, Request, Response } from 'express';
import ERole from '../model/enum/ERole';
import { baseErrorResponse } from '../helpers/response';

export const hasRole = (roles: ERole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.body.user.role))
      return res.status(403).send(baseErrorResponse('Access denied.'));

    next();
  };
};

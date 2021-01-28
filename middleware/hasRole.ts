import { NextFunction, Request, Response } from 'express';
import ERole from '../model/enum/ERole';
import { baseErrorResponse } from '../type/BaseResponse';

export const hasRole = (role: ERole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.user.role != role)
      return res.status(403).send(baseErrorResponse('Access denied.'));

    next();
  };
};

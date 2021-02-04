import express, { Request, Response } from 'express';
import User, { IUser } from '../model/user';
import bcrypt from 'bcrypt';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';
import { baseErrorResponse, baseResponse } from '../@types/BaseResponse';
import lodash from 'lodash';
import { validationOptions } from '../util/utils';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user: IUser | null = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(400)
      .send(baseErrorResponse('Invalid email or password.'));

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res
      .status(400)
      .send(baseErrorResponse('Invalid email or password.'));

  user.accessToken = user.generateAuthToken();

  res.send(baseResponse(user.response()));
});

const validate = (request: any) => {
  const schema: ObjectSchema = Joi.object({
    email: Joi.string().min(3).max(255).required().email(),
    password: Joi.string().min(3).max(1024).required()
  });

  return schema.validate(request, validationOptions);
};

export default router;

import * as _ from 'lodash';
import express, { Request, Response } from 'express';
import User, { IUser, validateCustomer } from '../model/user';
import * as bcrypt from 'bcrypt';
import { auth } from '../middleware/auth';
import { baseErrorResponse, baseResponse } from '../type/BaseResponse';

const router = express.Router();

router.get('/me', auth, async (req: Request, res: Response) => {
  const user: IUser = await User.findById(req.body.user._id).select(
    '-password'
  );
  res.send(user);
});

router.post('/', async (req: Request, res: Response) => {
  const { error } = validateCustomer(req.body);
  if (error)
    return res.status(400).send(baseErrorResponse(error.details[0].message));

  let user: IUser = await User.findOne({ email: req.body.email });
  if (user)
    return res.status(400).send(baseErrorResponse('User already registered.'));

  user = new User(req.body);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  user.accessToken = user.generateAuthToken();
  res.send(
    baseResponse(
      _.pick<IUser>(user, [
        'accessToken',
        '_id',
        'name',
        'email',
        'phone',
        'image',
        'gender',
        'status',
        'role'
      ]),
      'User created successfully.'
    )
  );
});

export default router;

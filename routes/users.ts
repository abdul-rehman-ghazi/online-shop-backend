import express, { NextFunction, Request, Response } from 'express';
import User, { IUser, validateUser } from '../model/user';
import * as bcrypt from 'bcrypt';
import { auth } from '../middleware/auth';
import { baseErrorResponse, baseResponse } from '../type/BaseResponse';
import ERole from '../model/enum/ERole';

const router = express.Router();

router.get('/me', auth, async (req: Request, res: Response) => {
  const user: IUser = await User.findById(req.body.user._id);
  res.send(baseResponse(user.response()));
});

const validateSignUpRequest = async (
  req: Request,
  res: Response,
  nextFunction: NextFunction
) => {
  const { error } = validateUser(req.body);
  if (error)
    return res.status(400).send(baseErrorResponse(error.details[0].message));

  const user: IUser = await User.findOne({ email: req.body.email });
  if (user)
    return res.status(400).send(baseErrorResponse('User already registered.'));

  nextFunction();
};

router.post('/', validateSignUpRequest, async (req: Request, res: Response) => {
  const user = new User(req.body);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  user.accessToken = user.generateAuthToken();
  res.send(baseResponse(user.response(), 'User created successfully.'));
});

router.post(
  '/seller',
  validateSignUpRequest,
  async (req: Request, res: Response) => {
    const user = new User(req.body);
    user.role = ERole.SELLER;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    user.accessToken = user.generateAuthToken();
    res.send(baseResponse(user.response(), 'User created successfully.'));
  }
);

export default router;

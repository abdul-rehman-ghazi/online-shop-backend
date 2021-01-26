import * as _ from 'lodash';
import express, { Request, Response } from 'express';
import User, { IUser, validateUser } from '../model/user';
import * as bcrypt from 'bcrypt';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/me', auth, async (req: Request, res: Response) => {
  const user: IUser = await User.findById(req.body.user._id).select(
    '-password'
  );
  res.send(user);
});

router.post('/', async (req: Request, res: Response) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user: IUser = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User(
    _.pick<IUser>(req.body, ['name', 'email', 'password'])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token: string = user.generateAuthToken();
  res.header('x-auth-token', token).send(
    _.pick<IUser>(user, ['_id', 'name', 'email'])
  );
});

export default router;

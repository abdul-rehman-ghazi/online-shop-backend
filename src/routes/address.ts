import express, { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../model/user';
import { auth } from '../middleware/auth';
import { hasRole } from '../middleware/hasRole';
import ERole from '../model/enum/ERole';
import { baseErrorResponse, baseResponse } from '../helpers/response';
import { ICartItem } from '../model/cartItem';
import { updateDocument, validateObjectId } from '../helpers/utils';
import { listPaginationResponse } from '../helpers/pagination';
import Address, { IAddress, validateAddress } from '../model/address';

const router = express.Router();

router.get(
  '/',
  [auth, hasRole([ERole.CUSTOMER])],
  async (req: Request, res: Response) => {
    const user: IUser | null = await User.findById(req.body.user._id)
      .select('addresses')
      .sort('-updatedAt');

    if (!user) return res.status(400).send('Invalid Request');
    res.send(
      baseResponse(listPaginationResponse<IAddress>(user.addresses, req.query))
    );
  }
);

const validateAddressRequest = async (
  req: Request,
  res: Response,
  nextFunction: NextFunction
) => {
  let { error } = validateAddress(req.body);
  if (error)
    return res.status(400).send(baseErrorResponse(error.details[0].message));

  const user: IUser | null = await User.findById(req.body.user._id).select(
    'addresses'
  );
  if (!user) return res.status(400).send(baseErrorResponse('User not found'));
  req.body.user = user;

  nextFunction();
};

router.post(
  '/',
  [auth, hasRole([ERole.CUSTOMER]), validateAddressRequest],
  async (req: Request, res: Response) => {
    const user: IUser = req.body.user;
    const addresses: IAddress[] = user.addresses;

    addresses.unshift(req.body);

    user
      .save()
      .then(() => res.send(baseResponse(addresses[0])))
      .catch((reason: string) =>
        res.status(400).send(baseErrorResponse(reason))
      );
  }
);

router.put(
  '/:id',
  [auth, hasRole([ERole.CUSTOMER]), validateAddressRequest],
  async (req: Request, res: Response) => {
    let { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

    const user: IUser = req.body.user;
    const addresses: IAddress[] = user.addresses;

    let updatedAddress = addresses.find(
      (value: IAddress) => value._id == req.params.id
    );

    if (updatedAddress) {
      updateDocument(updatedAddress, Address, req.body);
    } else {
      return res.status(404).send(baseErrorResponse('Not Found.'));
    }

    user
      .save()
      .then(() => res.send(baseResponse(updatedAddress)))
      .catch((reason: string) =>
        res.status(400).send(baseErrorResponse(reason))
      );
  }
);

router.delete(
  '/:id',
  [auth, hasRole([ERole.CUSTOMER])],
  async (req: Request, res: Response) => {
    let { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

    let user: IUser | null = await User.findById(req.body.user._id).select(
      'addresses'
    );
    if (!user) return res.status(400).send(baseErrorResponse('User not found'));

    let deleteAddress = user.addresses.find(
      (value: IAddress) => value._id == req.params.id
    );

    if (deleteAddress) {
      user.addresses = user.addresses.filter(
        (value: IAddress) => value._id != deleteAddress!._id
      );
    } else {
      return res.status(400).send(baseErrorResponse('Invalid Id.'));
    }

    user
      .save()
      .then(() => res.send(baseResponse(deleteAddress)))
      .catch((reason: string) =>
        res.status(400).send(baseErrorResponse(reason))
      );
  }
);
//
// router.get('/:id', async (req: Request, res: Response) => {
//   const { error } = validateObjectId(req.params.id);
//   if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));
//
//   const product: IProduct = await Product.findById(req.params.id).populate(
//     'category',
//     'name'
//   );
//   if (!product)
//     return res
//       .status(404)
//       .send(baseErrorResponse('The product with the given ID was not found.'));
//   res.send(baseResponse(product));
// });

export default router;

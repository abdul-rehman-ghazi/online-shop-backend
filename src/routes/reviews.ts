import express, { NextFunction, Request, Response } from 'express';
import Product, { IProduct, validateProduct } from '../model/product';
import { auth } from '../middleware/auth';
import { hasRole } from '../middleware/hasRole';
import ERole from '../model/enum/ERole';
import { baseErrorResponse, baseResponse } from '../helpers/response';
import CartItem, {
  ICartItem,
  ICartItemResponse,
  validateCartItem
} from '../model/cartItem';
import Product, { IProduct } from '../model/product';
import { IVariant } from '../model/variant';
import { updateDocument, validateObjectId } from '../helpers/utils';
import { listPaginationResponse } from '../helpers/pagination';
import { IReview, validateReview } from '../model/review';

const router = express.Router();

router.get(
  '/:productId',
  [auth, hasRole([ERole.CUSTOMER])],
  async (req: Request, res: Response) => {
    const { error } = validateObjectId(req.params.productId);
    if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

    const product: IProduct | null = await Product.findById(
      req.params.id
    ).select('reviews');
    if (!product)
      return res
        .status(404)
        .send(
          baseErrorResponse('The product with the given ID was not found.')
        );
    res.send(
      baseResponse(listPaginationResponse<IReview>(product.reviews, req.query))
    );
  }
);

router.post(
  '/:productId',
  [auth, hasRole([ERole.CUSTOMER])],
  async (req: Request, res: Response) => {
    let { error } = validateObjectId(req.params.productId);
    if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

    ({ error } = validateReview(req.body));
    if (error)
      return res.status(400).send(baseErrorResponse(error.details[0].message));

    const product: IProduct | null = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { reviews: req.body } },
      { new: true, useFindAndModify: false },
      (err: any, res1: IProduct | null) => {
        if (!product)
          return res
            .status(404)
            .send(
              baseErrorResponse('The product with the given ID was not found.')
            );

        res.send(
          baseResponse(
            listPaginationResponse<IReview>(product.reviews, req.query)
          )
        );
      }
    );
  }
);

router.put(
  '/:id',
  [auth, hasRole([ERole.CUSTOMER]), validateCartRequest],
  async (req: Request, res: Response) => {
    let { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

    const user = req.body.user;
    const cart: ICartItem[] = user.cart;

    let updatedCartItem = cart.find(
      (value: ICartItem) => value._id == req.params.id
    );

    if (updatedCartItem) {
      updateDocument(updatedCartItem, CartItem, req.body);
    } else {
      return res.status(400).send(baseErrorResponse('Invalid Id.'));
    }

    user
      .save()
      .then((value: IUser) => value.populate('cart.item').execPopulate())
      .then(() => res.send(baseResponse(updatedCartItem?.response() ?? null)))
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

    let user: IUser | null = await User.findById(req.body.user._id);
    if (!user) return res.status(400).send(baseErrorResponse('User not found'));

    user = await user.populate('cart.item').execPopulate();

    let deleteCartItem = user.cart
      .find((value: ICartItem) => value._id == req.params.id)
      ?.response();

    if (deleteCartItem) {
      user.cart = user.cart.filter(
        (value: ICartItem) => value._id != deleteCartItem?._id
      );
    } else {
      return res.status(400).send(baseErrorResponse('Invalid Id.'));
    }

    user
      .save()
      .then(() => res.send(baseResponse(deleteCartItem ?? null)))
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

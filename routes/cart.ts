import express, { Request, Response } from 'express';
import User, { IUser } from '../model/user';
import { auth } from '../middleware/auth';
import { hasRole } from '../middleware/hasRole';
import ERole from '../model/enum/ERole';
import { baseErrorResponse, baseResponse } from '../type/BaseResponse';
import { ICartItem, validateCartItem } from '../model/cartItem';
import Product, { IProduct } from '../model/product';
import { IVariant } from '../model/variant';

const router = express.Router();

router.get(
  '/',
  [auth, hasRole([ERole.CUSTOMER])],
  async (req: Request, res: Response) => {
    const user = await User.findById(req.body.user._id)
      .select('cart')
      .sort('createdAt');
    res.send(baseResponse(user.cart));
  }
);

router.post(
  '/',
  [auth, hasRole([ERole.CUSTOMER])],
  async (req: Request, res: Response) => {
    let { error } = validateCartItem(req.body);
    if (error)
      return res.status(400).send(baseErrorResponse(error.details[0].message));

    const request: ICartItem = req.body;

    const product: IProduct = await Product.findById(request.item);
    if (!product)
      return res.status(404).send(baseErrorResponse('Invalid itemId.'));

    if (
      product.variant.variants &&
      !product.variant.variants.find(
        (value: IVariant) => value._id == request.variantId
      )
    )
      return res.status(404).send(baseErrorResponse('Invalid variantId.'));

    const user: IUser = await User.findById(req.body.user._id);
    if (!user) return res.status(400).send(baseErrorResponse('User not found'));

    const cart: ICartItem[] = user.cart;

    let updatedCartItem = cart.find(
      (value: ICartItem) =>
        value.item == request.item && value.variantId == request.variantId
    );

    if (updatedCartItem)
      updatedCartItem.quantity = updatedCartItem.quantity + request.quantity;
    else {
      cart.unshift(request);
      updatedCartItem = cart[0];
    }

    user
      .save()
      .then((value: IUser) => value.populate('cart.item').execPopulate())
      .then((value: IUser) =>
        res.send(baseResponse(updatedCartItem?.response() ?? null))
      )
      .catch((reason) => res.status(400).send(baseErrorResponse(reason)));
  }
);
//
// router.put(
//   '/:id',
//   [auth, hasRole([ERole.SELLER, ERole.ADMIN])],
//   async (req: Request, res: Response) => {
//     let { error } = validateObjectId(req.params.id);
//     if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));
//
//     ({ error } = validateProduct(req.body));
//     if (error)
//       return res.status(400).send(baseErrorResponse(error.details[0].message));
//
//     if (req.body.categoryId) {
//       const category = await Category.findById(req.body.categoryId);
//       if (!category)
//         return res.status(400).send(baseErrorResponse('Invalid category id.'));
//     }
//
//     await Product.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true }
//     )
//       .populate('category', 'name')
//       .exec((err: any, doc: IProduct | null) => {
//         if (err) return res.status(400).send(baseErrorResponse(err));
//
//         if (!doc)
//           return res
//             .status(404)
//             .send(
//               baseErrorResponse('The product with the given ID was not found.')
//             );
//
//         return res.send(baseResponse(doc));
//       });
//   }
// );
//
// router.delete(
//   '/:id',
//   [auth, hasRole([ERole.SELLER, ERole.ADMIN])],
//   async (req: Request, res: Response) => {
//     let { error } = validateObjectId(req.params.id);
//     if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));
//
//     const product: IProduct = await Product.findById(req.params.id);
//     if (!product)
//       return res
//         .status(404)
//         .send(
//           baseErrorResponse('The product with the given ID was not found.')
//         );
//
//     await product.deleteOne();
//
//     res.send(product);
//   }
// );
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

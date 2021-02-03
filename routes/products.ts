import express, { Request, Response } from 'express';
import Product, { IProduct, validateProduct } from '../model/product';
import { auth } from '../middleware/auth';
import { hasRole } from '../middleware/hasRole';
import ERole from '../model/enum/ERole';
import { baseErrorResponse, baseResponse } from '../type/BaseResponse';
import { validateObjectId } from '../util/utils';
import Category from '../model/category';
import { FilterQuery } from 'mongoose';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const products = await Product.find()
    .populate('category', 'name')
    .sort('name');
  res.send(baseResponse(products));
});

router.post(
  '/',
  [auth, hasRole([ERole.SELLER, ERole.ADMIN])],
  async (req: Request, res: Response) => {
    let { error } = validateProduct(req.body, true);
    if (error)
      return res.status(400).send(baseErrorResponse(error.details[0].message));

    const category = await Category.findById(req.body.category);
    if (!category)
      return res.status(400).send(baseErrorResponse('Invalid category id.'));

    const product: IProduct = new Product({
      ...req.body,
      sellerId: req.body.user._id
    });

    product
      .save()
      .then((value: IProduct) =>
        value.populate('category', 'name').execPopulate()
      )
      .then((value: IProduct) => res.send(baseResponse(value)))
      .catch((reason) => res.status(400).send(baseErrorResponse(reason)));
  }
);

router.put(
  '/:id',
  [auth, hasRole([ERole.SELLER, ERole.ADMIN])],
  async (req: Request, res: Response) => {
    let { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

    ({ error } = validateProduct(req.body));
    if (error)
      return res.status(400).send(baseErrorResponse(error.details[0].message));

    if (req.body.categoryId) {
      const category = await Category.findById(req.body.categoryId);
      if (!category)
        return res.status(400).send(baseErrorResponse('Invalid category id.'));
    }

    const conditions: FilterQuery<IProduct> =
      req.body.user.role == ERole.ADMIN
        ? { _id: req.params.id }
        : { _id: req.params.id, sellerId: req.body.user._id };

    await Product.findOneAndUpdate(
      conditions,
      { $set: req.body },
      { new: true }
    )
      .populate('category', 'name')
      .exec((err: any, doc: IProduct | null) => {
        if (err) return res.status(400).send(baseErrorResponse(err));

        if (!doc)
          return res
            .status(404)
            .send(
              baseErrorResponse('The product with the given ID was not found.')
            );

        return res.send(baseResponse(doc));
      });
  }
);

router.delete(
  '/:id',
  [auth, hasRole([ERole.SELLER, ERole.ADMIN])],
  async (req: Request, res: Response) => {
    let { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

    const product: IProduct = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .send(
          baseErrorResponse('The product with the given ID was not found.')
        );

    await product.deleteOne();

    res.send(product);
  }
);

router.get('/:id', async (req: Request, res: Response) => {
  const { error } = validateObjectId(req.params.id);
  if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

  const product: IProduct = await Product.findById(req.params.id).populate(
    'category',
    'name'
  );
  if (!product)
    return res
      .status(404)
      .send(baseErrorResponse('The product with the given ID was not found.'));
  res.send(baseResponse(product));
});

export default router;

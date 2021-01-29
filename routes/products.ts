import express, { Request, Response } from 'express';
import Product, { IProduct, validateProduct } from '../model/product';
import { auth } from '../middleware/auth';
import { hasRole } from '../middleware/hasRole';
import ERole from '../model/enum/ERole';
import { baseErrorResponse, baseResponse } from '../type/BaseResponse';
import { updateDocument, validateObjectId } from '../util/utils';
import Category from '../model/category';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const products = await Product.find().sort('name');
  res.send(baseResponse(products));
});

router.post(
  '/',
  [auth, hasRole([ERole.SELLER, ERole.ADMIN])],
  async (req: Request, res: Response) => {
    let { error } = validateProduct(req.body);
    if (error)
      return res.status(400).send(baseErrorResponse(error.details[0].message));

    const category = await Category.findById(req.body.categoryId);
    if (!category)
      res.status(400).send(baseErrorResponse('Invalid category id.'));

    const product: IProduct = new Product(req.body);
    product.sellerId = req.body.user._id;
    product.category._id = category._id;
    product.category.name = category.name;

    await product.save();
    res.send(baseResponse(product));
  }
);

router.put(
  '/:id',
  [auth, hasRole([ERole.SELLER, ERole.ADMIN])],
  async (req: Request, res: Response) => {
    let { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

    let product: IProduct = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .send(
          baseErrorResponse('The product with the given ID was not found.')
        );

    ({ error } = validateProduct(req.body));
    if (error)
      return res.status(400).send(baseErrorResponse(error.details[0].message));

    const category = await Category.findById(req.body.categoryId);
    if (!category)
      res.status(400).send(baseErrorResponse('Invalid category id.'));

    updateDocument<IProduct>(product, Product, req.body);
    product.category._id = category._id;
    product.category.name = category.name;

    await product.save();
    res.send(baseResponse(product));
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

  const product: IProduct = await Product.findById(req.params.id);
  if (!product)
    return res
      .status(404)
      .send(baseErrorResponse('The product with the given ID was not found.'));
  res.send(baseResponse(product));
});

export default router;

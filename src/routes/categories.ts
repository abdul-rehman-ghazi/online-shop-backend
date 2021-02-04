import express, { Request, Response } from 'express';
import Category, { ICategory, validateCategory } from '../model/category';
import { auth } from '../middleware/auth';
import { hasRole } from '../middleware/hasRole';
import ERole from '../model/enum/ERole';
import { baseErrorResponse, baseResponse } from '../@types/BaseResponse';
import { validateObjectId } from '../util/utils';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const categories = await Category.find().sort('name');
  res.send(baseResponse(categories));
});

router.post(
  '/',
  [auth, hasRole([ERole.ADMIN])],
  async (req: Request, res: Response) => {
    const { error } = validateCategory(req.body);
    if (error)
      return res.status(400).send(baseErrorResponse(error.details[0].message));

    const category: ICategory = new Category(req.body);

    await category.save();
    res.send(baseResponse(category));
  }
);

router.put(
  '/:id',
  [auth, hasRole([ERole.ADMIN])],
  async (req: Request, res: Response) => {
    let { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

    let category: ICategory | null = await Category.findById(req.params.id);
    if (!category)
      return res
        .status(404)
        .send(
          baseErrorResponse('The category with the given ID was not found.')
        );

    ({ error } = validateCategory(req.body));

    if (error)
      return res.status(400).send(baseErrorResponse(error.details[0].message));

    category.name = req.body.name;
    category.description = req.body.description;
    await category.save();
    res.send(baseResponse(category));
  }
);

router.delete(
  '/:id',
  [auth, hasRole([ERole.ADMIN])],
  async (req: Request, res: Response) => {
    let { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

    const category: ICategory | null = await Category.findById(req.params.id);
    if (!category)
      return res
        .status(404)
        .send(
          baseErrorResponse('The category with the given ID was not found.')
        );

    await category.deleteOne();

    res.send(category);
  }
);

router.get('/:id', async (req: Request, res: Response) => {
  const { error } = validateObjectId(req.params.id);
  if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

  const category: ICategory | null = await Category.findById(req.params.id);
  if (!category)
    return res
      .status(404)
      .send(baseErrorResponse('The category with the given ID was not found.'));
  res.send(baseResponse(category));
});

export default router;

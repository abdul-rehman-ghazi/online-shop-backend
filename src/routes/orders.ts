import express, { Request, Response } from 'express';
import Order, {
  IOrder,
  toOrder,
  validateOrder,
  validateOrderStatus
} from '../model/order';
import { auth } from '../middleware/auth';
import { hasRole } from '../middleware/hasRole';
import ERole from '../model/enum/ERole';
import { baseErrorResponse, baseResponse } from '../helpers/response';
import { validateObjectId } from '../helpers/utils';
import { paginationResponse } from '../helpers/pagination';
import { FilterQuery } from 'mongoose';

const router = express.Router();

router.get(
  '/',
  [auth, hasRole([ERole.CUSTOMER, ERole.ADMIN])],
  async (req: Request, res: Response) => {
    const filterQuery: FilterQuery<IOrder> =
      req.body.user.role == ERole.CUSTOMER ? { userId: req.body.user._id } : {};
    if (req.query.status)
      filterQuery.$expr = {
        $eq: [{ $arrayElemAt: ['$statuses.status', -1] }, req.query.status]
      };
    const orders = await paginationResponse<IOrder>(
      Order,
      Order.find(filterQuery).sort('-updatedAt'),
      req.query
    );
    res.send(baseResponse(orders));
  }
);

router.post(
  '/',
  [auth, hasRole([ERole.CUSTOMER])],
  async (req: Request, res: Response) => {
    let { error } = validateOrder(req.body);
    if (error)
      return res.status(400).send(baseErrorResponse(error.details[0].message));

    const order: IOrder = await toOrder(req.body, req.body.user._id);

    order
      .save()
      .then((value: IOrder) => res.send(baseResponse(value)))
      .catch((reason) =>
        res.status(400).send(baseErrorResponse(reason.message))
      );
  }
);

router.put(
  '/:id',
  [auth, hasRole([ERole.ADMIN])],
  async (req: Request, res: Response) => {
    let { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

    ({ error } = validateOrderStatus(req.body));
    if (error)
      return res.status(400).send(baseErrorResponse(error.details[0].message));

    await Order.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { statuses: { date: new Date(), status: req.body.status } } },
      { new: true }
    ).exec((err: any, doc: IOrder | null) => {
      if (err) return res.status(400).send(baseErrorResponse(err));

      if (!doc)
        return res
          .status(404)
          .send(
            baseErrorResponse('The order with the given ID was not found.')
          );

      return res.send(baseResponse(doc));
    });
  }
);

router.delete(
  '/:id',
  [auth, hasRole([ERole.ADMIN])],
  async (req: Request, res: Response) => {
    let { error } = validateObjectId(req.params.id);
    if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

    const order: IOrder | null = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .send(baseErrorResponse('The order with the given ID was not found.'));

    await order.delete();

    res.send(order);
  }
);

router.get('/:id', async (req: Request, res: Response) => {
  const { error } = validateObjectId(req.params.id);
  if (error) return res.status(400).send(baseErrorResponse('Invalid ID.'));

  const order: IOrder | null = await Order.findById(req.params.id);
  if (!order)
    return res
      .status(404)
      .send(baseErrorResponse('The order with the given ID was not found.'));
  res.send(baseResponse(order));
});

export default router;

import express, { Request, Response } from 'express';
import Customer, { ICustomer, validateCustomer } from '../model/customer';
import { Error } from 'mongoose';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const customers: ICustomer[] = await Customer.find().sort('name');
  res.send(customers);
});

router.get('/:id', async (req: Request, res: Response) => {
  const customer: ICustomer = await Customer.findById(req.params.id);
  if (!customer)
    return res
      .status(404)
      .send('The customer with the given ID was not found.');

  res.send(customer);
});

router.post('/', async (req: Request, res: Response) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer: ICustomer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone
  });

  customer
    .save()
    .then((value: ICustomer) => {
      res.send(value);
    })
    .catch((reason: Error.ValidationError) =>
      res.status(400).send(reason.message)
    );
});

router.put('/:id', async (req: Request, res: Response) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  Customer.findById(req.params.id)
    .then((customer: ICustomer) => {
      if (customer) {
        customer.name = req.body.name;
        if (req.body.isGold != undefined) customer.isGold = req.body.isGold;
        if (req.body.phone != undefined) customer.phone = req.body.phone;
        return customer.save();
      } else {
        return res
          .status(404)
          .send('The customer with the given ID was not found.');
      }
    })
    .then((customer: ICustomer) => res.send(customer))
    .catch((error: string) => {
      res.status(400).send(error);
    });
});

router.delete('/:id', async (req: Request, res: Response) => {
  Customer.findById(req.params.id)
    .then<ICustomer>(async (customer: ICustomer) => {
      if (customer) {
        await customer.deleteOne();
        res.send(customer);
      } else {
        return res
          .status(404)
          .send('The customer with the given ID was not found.');
      }
    })
    .catch((error: string) => res.status(400).send(error));
});

export default router;

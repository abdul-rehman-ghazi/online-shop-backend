import Rental, { IRental, validateRental } from '../model/rental';
import Movie, { IMovie } from '../model/movie';
import Customer, { ICustomer } from '../model/customer';
import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const rentals: IRental[] = await Rental.find().sort('-dateOut');
  res.send(rentals);
});

router.post('/', async (req: Request, res: Response) => {
  const { error } = validateRental(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer: ICustomer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send('Customer not found');

  const movie: IMovie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('Movie not found.');

  if (movie.numberInStock === 0)
    return res.status(400).send('Movie not in stock.');

  let rental: IRental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  });
  rental = await rental.save();

  movie.numberInStock--;
  await movie.save();

  res.send(rental);
});

router.get('/:id', async (req, res) => {
  const rental: IRental = await Rental.findById(req.params.id);

  if (!rental)
    return res.status(404).send('The rental with the given ID was not found.');

  res.send(rental);
});

export default router;

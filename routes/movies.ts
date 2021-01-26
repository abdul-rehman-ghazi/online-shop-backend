import express, { Request, Response } from 'express';
import Movie, { IMovie, validateMovie } from '../model/movie';
import Genre from '../model/genre';
import { Error } from 'mongoose';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const movies: IMovie[] = await Movie.find().sort('title');
  res.send(movies);
});

router.get('/:id', async (req: Request, res: Response) => {
  const movie: IMovie = await Movie.findById(req.params.id);
  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

router.post('/', async (req: Request, res: Response) => {
  const { error } = validateMovie(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Genre not found.');

  const movie: IMovie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate
  });

  movie
    .save()
    .then((value: IMovie) => {
      res.send(value);
    })
    .catch((reason: Error.ValidationError) =>
      res.status(400).send(reason.message)
    );
});

router.put('/:id', async (req: Request, res: Response) => {
  const { error } = validateMovie(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  Movie.findById(req.params.id)
    .then(async (movie: IMovie) => {
      if (movie) {
        const genre = await Genre.findById(req.body.genreId);
        if (!genre) return res.status(400).send('Genre not found.');

        movie.title = req.body.title;
        movie.genre._id = genre._id;
        movie.genre.name = genre.name;
        movie.numberInStock = req.body.numberInStock;
        movie.dailyRentalRate = req.body.dailyRentalRate;
        return movie.save();
      } else {
        return res
          .status(404)
          .send('The movie with the given ID was not found.');
      }
    })
    .then((customer: IMovie) => res.send(customer))
    .catch((error: string) => {
      res.status(400).send(error);
    });
});

router.delete('/:id', async (req: Request, res: Response) => {
  Movie.findById(req.params.id)
    .then<IMovie>(async (movie: IMovie) => {
      if (movie) {
        await movie.deleteOne();
        res.send(movie);
      } else {
        return res
          .status(404)
          .send('The movie with the given ID was not found.');
      }
    })
    .catch((error: string) => res.status(400).send(error));
});

export default router;

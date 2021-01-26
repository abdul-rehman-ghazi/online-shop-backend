import express, { Request, Response } from 'express';
import Genre, { IGenre, validateGenre } from '../model/genre';
import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  // throw new Error('Could not get the genres');
  const genres = await Genre.find().sort('name');
  res.send(genres);
});

router.post('/', auth, async (req: Request, res: Response) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre: IGenre = new Genre({
    name: req.body.name
  });

  await genre.save();
  res.send(genre);
});

router.put('/:id', async (req: Request, res: Response) => {
  const genre: IGenre = await Genre.findById(req.params.id);
  if (!genre)
    return res.status(404).send('The genre with the given ID was not found.');

  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  genre.name = req.body.name;
  await genre.save();
  res.send(genre);
});

router.delete('/:id', [auth, admin], async (req: Request, res: Response) => {
  const genre: IGenre = await Genre.findById(req.params.id);
  if (!genre)
    return res.status(404).send('The genre with the given ID was not found.');

  await genre.deleteOne();

  res.send(genre);
});

router.get('/:id', async (req: Request, res: Response) => {
  Genre.findById(req.params.id)
    .catch<string>((err: string) => res.status(400).send(err))
    .then<IGenre>((r: IGenre) => {
      if (!r)
        res.status(404).send('The genre with the given ID was not found.');
      res.send(r);
    });
});

export default router;

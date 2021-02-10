import express from 'express';
import routes from './startup/routes';
import db from './startup/db';
import logging from './startup/logging';
import config from './startup/config';
import winston from 'winston';
import firebase from './startup/firebase';

const app = express();

logging();
db();
config();
firebase();
routes(app);

const port = process.env.PORT || 3000;
app.listen(port, () => winston.info(`Listening on port ${port}...`));

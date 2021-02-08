import winston from 'winston';
import { MongoDB } from 'winston-mongodb';
import 'express-async-errors';

export default () => {
  // winston.exceptions.handle(
  //   new winston.transports.Console({
  //     format: winston.format.combine(
  //       winston.format.colorize(),
  //       winston.format.prettyPrint()
  //     )
  //   }),
  //   new winston.transports.File({ filename: 'uncaughtExceptions.log', dirname: 'public' })
  // );

  process.on('unhandledRejection', (error: Error) => {
    throw error;
  });

  winston.add(
    new winston.transports.File({ filename: 'logfile.log', dirname: 'public' })
  );
  winston.add(
    new MongoDB({ db: 'mongodb://localhost/practice', level: 'info' })
  );
};

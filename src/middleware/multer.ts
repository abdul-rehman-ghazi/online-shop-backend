import multer from 'multer';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void
  ) => {
    callback(null, 'profile_images');
  },
  filename(
    req: Request,

    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void
  ): void {
    callback(null, `${file.fieldname} - ${Date.now()}`);
  }
});

export default multer({ storage: storage });

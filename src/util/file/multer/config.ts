/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer, { diskStorage } from 'multer';
import ValidationError from 'src/util/error/validation-error';

export const FILE_MAX_SIZE = {
  ONE_MEGABYTES: 1 * 1024 * 1024,
  TWO_MEGABYTES: 2 * 1024 * 1024,
};

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
];

const fileFolderPath = resolve(__dirname, '../../../../files/temp');

const multerConfig: multer.Options = {
  dest: fileFolderPath,
  storage: diskStorage({
    destination: (_request: any, _file: Express.Multer.File, cb: any) => {
      cb(null, fileFolderPath);
    },
    filename: (_request: any, _file: Express.Multer.File, cb: any) => {
      const filename = `${uuidv4()}`;

      cb(null, filename);
    },
  }),
  limits: {
    fileSize: FILE_MAX_SIZE.TWO_MEGABYTES,
  },
  fileFilter: (request: any, file: Express.Multer.File, cb: any): any => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError('INVALID_FILE_TYPE'));
    }
  },
};

export default multerConfig;

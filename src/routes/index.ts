import { Router } from 'express';
import multer from 'multer';
import AlertImage from 'src/controllers/AlertImage';
import multerConfig from 'src/util/file/multer/config';
import init from 'src/util/router';
import { auth } from './middlewares';
import makeExpressCallback from './util/make-express-callback';

const routes = Router();

init(routes);

routes.post(
  '/alert-image/:id',
  auth.isAuthenticated,
  AlertImage.create.validation,
  multer(multerConfig).single('file'),
  makeExpressCallback(AlertImage.create.method),
);

routes.get(
  '/alert-image/:id/:dimension/:imageClass',
  AlertImage.get.validation,
  makeExpressCallback(AlertImage.get.method),
);

export default routes;

import { param } from 'express-validator';
import getMessage from 'src/util/i18n/methods/get-message';

export default [
  param('id')
    .not().isEmpty()
    .withMessage(getMessage('ID_REQUIRED'))
    .isString()
    .withMessage(getMessage('ID_INVALID'))
    .isUUID()
    .withMessage(getMessage('ID_INVALID'))
    .trim()
    .escape(),
  param('dimension')
    .not().isEmpty()
    .withMessage(getMessage('DIMENSION_REQUIRED'))
    .isString()
    .withMessage(getMessage('DIMENSION_INVALID'))
    .trim()
    .escape(),
  param('imageClass')
    .not().isEmpty()
    .withMessage(getMessage('IMAGE_CLASS_REQUIRED'))
    .isString()
    .withMessage(getMessage('IMAGE_CLASS_INVALID'))
    .trim()
    .escape(),
];

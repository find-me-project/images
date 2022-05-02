import { OutputInfo } from 'sharp';
import ValidationError from 'src/util/error/validation-error';
import { ImageClassEnum } from 'src/util/image';
import { uuidValidateV4 } from 'src/util/uuid';
import { v4 as uuidv4 } from 'uuid';
import { AlertImageDimensionEnum, AlertImageType } from '..';

export default function makeAlertImage (alertImage: AlertImageType, accountId: string, file: OutputInfo): Readonly<AlertImageType> {
  if (alertImage._id && !uuidValidateV4(alertImage._id)) {
    throw new ValidationError('ID_INVALID');
  }

  if (!accountId) {
    throw new ValidationError('ACCOUNT_ID_REQUIRED');
  }

  if (!uuidValidateV4(accountId)) {
    throw new ValidationError('ACCOUNT_ID_INVALID');
  }

  if (!file) {
    throw new ValidationError('FILE_REQUIRED');
  }

  if (!alertImage.name) {
    throw new ValidationError('NAME_REQUIRED');
  }

  if (!alertImage.type) {
    throw new ValidationError('TYPE_REQUIRED');
  }

  if (!alertImage.size) {
    throw new ValidationError('SIZE_REQUIRED');
  }

  if (!alertImage.dimensions) {
    throw new ValidationError('DIMENSIONS_REQUIRED');
  }

  if (!Object.values(AlertImageDimensionEnum).includes(alertImage.dimensions)) {
    throw new ValidationError('DIMENSIONS_INVALID');
  }

  if (!alertImage.class) {
    throw new ValidationError('CLASS_ID_REQUIRED');
  }

  if (!Object.values(ImageClassEnum).includes(alertImage.class)) {
    throw new ValidationError('CLASS_ID_INVALID');
  }

  const {
    width,
    height,
  } = file;

  const dimensions = alertImage.dimensions.split('x');

  if (width !== parseInt(dimensions[0], 10) || height !== parseInt(dimensions[1], 10)) {
    throw new ValidationError('IMAGE_INVALID_DIMENSION', {
      width: parseInt(dimensions[0], 10), height: parseInt(dimensions[1], 10),
    });
  }

  return Object.freeze({
    _id: alertImage._id || uuidv4(),
    name: alertImage.name,
    type: alertImage.type,
    size: alertImage.size,
    dimensions: alertImage.dimensions,
    class: alertImage.class,
  });
}

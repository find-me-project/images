import { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { AlertImageDimensionEnum } from 'src/models/AlertImage';
import { AlertImageService } from 'src/services';
import { ImageClassEnum } from 'src/util/image';
import parameterValidation from './parameter-validation';

async function method (request: Request, response: Response, session?: ClientSession): Promise<Response> {
  const {
    id,
    dimension,
    imageClass,
  } = request.params;

  const service = new AlertImageService(session);
  const url = await service.getImage(id, dimension as AlertImageDimensionEnum, imageClass as ImageClassEnum);

  return response.success({
    url: url,
  });
}

export default {
  validation: parameterValidation,
  method: method,
};

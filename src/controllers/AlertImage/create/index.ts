import { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { AlertImageService } from 'src/services';
import parameterValidation from './parameter-validation';

async function method (request: Request, response: Response, session?: ClientSession): Promise<Response> {
  const {
    id,
  } = request.params;

  const {
    accountId,
  } = request.accessData!;

  const { file } = request;

  const service = new AlertImageService(session);
  await service.create(id, accountId!, file!);

  return response.success(undefined, 'IMAGE_UPLOAD_SUCCESSFUL');
}

export default {
  validation: parameterValidation,
  method: method,
};

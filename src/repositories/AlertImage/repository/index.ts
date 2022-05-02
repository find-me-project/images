import { ClientSession } from 'mongoose';
import { AlertImageType } from 'src/models/AlertImage';
import { AlertImageModel } from 'src/models/AlertImage/schema';
import IAlertImageRepository from '..';

export class AlertImageRepository implements IAlertImageRepository {
  private session?: ClientSession;

  constructor (session?: ClientSession) {
    this.session = session;
  }

  async create (image: AlertImageType): Promise<void> {
    const result = new AlertImageModel(image);
    await result.save({ session: this.session });
  }
}

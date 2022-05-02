import { ClientSession } from 'mongoose';
import { AlertStatusEnum } from 'src/models/Alert';
import { AlertModel } from 'src/models/Alert/schema';
import { AlertImageDimensionEnum, AlertImageType } from 'src/models/AlertImage';
import { ImageClassEnum } from 'src/util/image';
import IAlertRepository from '..';

export class AlertRepository implements IAlertRepository {
  private session?: ClientSession;

  constructor (session?: ClientSession) {
    this.session = session;
  }

  static async existsByIdAndAccountId (alertId: string, accountId: string): Promise<boolean> {
    const result = await AlertModel.exists({
      _id: alertId,
      account: accountId,
      status: AlertStatusEnum.inProgress,
      images: null,
    });

    return !!result;
  }

  async addImage (alertId: string, image: string): Promise<void> {
    await AlertModel.updateOne(
      { _id: alertId },
      {
        $push: {
          images: image,
        },
        $set: {
          status: AlertStatusEnum.active,
        },
      },
      {
        session: this.session,
      },
    ).exec();
  }

  async getImage (alertId: string, dimension: AlertImageDimensionEnum, imageClass: ImageClassEnum): Promise<AlertImageType | undefined> {
    const result = await AlertModel.findOne(
      { _id: alertId },
      undefined,
      {
        session: this.session,
      },
    ).exec();

    if (result) {
      const image = await result
        .populate({
          path: 'images',
          match: {
            dimensions: dimension,
            class: imageClass,
          },
        });

      if (image.images) {
        return image.images[0] as AlertImageType;
      }
    }

    return undefined;
  }
}

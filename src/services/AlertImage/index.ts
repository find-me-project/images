import IAlertImageRepository from 'src/repositories/AlertImage';
import { ClientSession } from 'mongoose';
import { AlertImageRepository } from 'src/repositories/AlertImage/repository';
import { AlertImageDimensionEnum, AlertImageType } from 'src/models/AlertImage';
import makeAlertImage from 'src/models/AlertImage/model';
import { AlertRepository } from 'src/repositories';
import ValidationError from 'src/util/error/validation-error';
import { ImageClassEnum, ImageClassResolutionEnum } from 'src/util/image';
import { v4 as uuidv4 } from 'uuid';
import { resolve } from 'path';
import { removeFile } from 'src/util/file';
import sharp, { OutputInfo } from 'sharp';
import IAlertRepository from 'src/repositories/Alert';
import { StorageService } from 'src/util/aws';
import { RedisService } from 'src/util/redis';

export class AlertImageService {
  private repository: IAlertImageRepository;

  private alertRepository: IAlertRepository;

  private storageService: StorageService;

  private redisService: RedisService;

  constructor (session?: ClientSession, readOnly?: boolean) {
    this.repository = new AlertImageRepository(session);
    this.alertRepository = new AlertRepository(session);
    this.storageService = new StorageService(readOnly);
    this.redisService = new RedisService();
  }

  private static makeImageList (file: Express.Multer.File): AlertImageType[] {
    const list: AlertImageType[] = [];

    Object.entries(AlertImageDimensionEnum).forEach(([, dimension]) => {
      Object.entries(ImageClassEnum).forEach(([, imageClass]) => {
        const id = uuidv4();
        const image: AlertImageType = {
          _id: id,
          name: `${id}.webp`,
          type: 'image/webp',
          size: file.size,
          dimensions: dimension,
          class: imageClass,
        };

        list.push(image);
      });
    });

    return list;
  }

  private static async canCreate (id: string, accountId: string, file: Express.Multer.File): Promise<boolean> {
    if (!file) {
      throw new ValidationError('FILE_REQUIRED');
    }

    const alertExists = await AlertRepository.existsByIdAndAccountId(id, accountId);
    if (!alertExists) {
      throw new ValidationError('ALERT_NOT_FOUND');
    }

    const { width, height } = await sharp(`${file.destination}/${file.filename}`).metadata();
    const dimensions = AlertImageDimensionEnum.LARGE.split('x');

    if (width !== parseInt(dimensions[0], 10) || height !== parseInt(dimensions[1], 10)) {
      throw new ValidationError('IMAGE_INVALID_DIMENSION', {
        width: parseInt(dimensions[0], 10), height: parseInt(dimensions[1], 10),
      });
    }

    return true;
  }

  private async saveImage (id: string, image: AlertImageType, accountId: string, file: OutputInfo): Promise<void> {
    const newImage = makeAlertImage(image, accountId, file);

    await this.repository.create(newImage);
    await this.alertRepository.addImage(id, newImage._id!);
  }

  private async makeImageFile (id: string, image: AlertImageType, file: Express.Multer.File, accountId: string): Promise<void> {
    const dimensions = image.dimensions!.split('x');

    const imageClassIndex = Object.keys(ImageClassResolutionEnum).indexOf(image.class!);
    const imageClass = Object.values(ImageClassResolutionEnum)[imageClassIndex];

    const width = parseInt(dimensions[0], 10);
    const height = parseInt(dimensions[1], 10);

    const filePath = resolve(__dirname, '../../../files');
    const path = `${file.destination}/${file.filename}`;

    const sharpFile = await sharp(path) // files/temp/{UUID}
      .resize(width, height)
      .webp({ quality: parseInt(imageClass, 10), lossless: true })
      .toFile(`${filePath}/${image.name}`); // files/{UUID}

    await this.saveImage(id, image, accountId, sharpFile);
  }

  async create (id: string, accountId: string, file: Express.Multer.File): Promise<void> {
    const {
      AWS_ALERT_BUCKET,
    } = process.env;

    if (!AWS_ALERT_BUCKET) {
      throw new ValidationError('INTERNAL_ERROR_INVALID_ENV');
    }

    await AlertImageService.canCreate(id, accountId, file);

    const imageList = AlertImageService.makeImageList(file);
    const filePath = resolve(__dirname, '../../../files');

    try {
      const promiseList = imageList.map((image) => this.makeImageFile(id, image, file, accountId));
      await Promise.all(promiseList);

      const uploadList = imageList.map((image) => {
        const path = `${filePath}/${image.name}`;

        return this.storageService.sendFile(path, image.name, id, AWS_ALERT_BUCKET);
      });
      await Promise.all(uploadList);
    } finally {
      imageList.forEach((image) => {
        const path = `${filePath}/${image.name}`;

        removeFile(path);
      });
    }
  }

  async getImage (alertId: string, dimension: AlertImageDimensionEnum, imageClass: ImageClassEnum): Promise<string> {
    const {
      AWS_ALERT_BUCKET,
    } = process.env;

    if (!AWS_ALERT_BUCKET) {
      throw new ValidationError('INTERNAL_ERROR_INVALID_ENV');
    }

    const image = await this.alertRepository.getImage(alertId, dimension, imageClass);
    if (!image) {
      throw new ValidationError('IMAGE_NOT_FOUND');
    }

    const key = `${image.name}-${image.dimensions}-${image.class}`;
    const tempUrl = await this.redisService.get(key);

    if (!tempUrl) {
      const url = await this.storageService.getFileUrl(AWS_ALERT_BUCKET, alertId, image.name);

      await this.redisService.set(key, url, 1500);

      return url;
    }

    return tempUrl;
  }
}

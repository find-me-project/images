import { ImageClassEnum } from 'src/util/image';

export enum AlertImageDimensionEnum {
  LARGE = '500x500',
  MEDIUM = '250x250',
  SMALL = '100x100',
}

export type AlertImageType = {
  _id?: string,
  name: string,
  type: string,
  size?: number,
  dimensions?: AlertImageDimensionEnum,
  class?: ImageClassEnum,
  createdAt?: Date,
  updatedAt?: Date,
}

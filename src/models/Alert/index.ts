import { AlertImageType } from '../AlertImage';

export enum AlertTypeEnum {
  person = 'Person',
  pet = 'Pet'
}

export enum LocationTypeEnum {
  point = 'Point'
}

export type LocationType = {
  type?: LocationTypeEnum,
  coordinates: number[],
}

export enum AlertStatusEnum {
  active = 'Active',
  inProgress = 'InProgress',
}

export type AlertType = {
  _id?: string,
  type: AlertTypeEnum,
  data: {
    name: string,
    birthDate: Date,
    disappearDate: Date,
    isPcd?: boolean,
  },
  images?: AlertImageType[] | string[],
  additionalInfo?: string,
  location: LocationType,
  account: string,
  status?: AlertStatusEnum,
  createdAt?: Date,
  updatedAt?: Date,
}

import { model, Schema } from 'mongoose';
import { AlertImageType } from '..';

export const ALERT_IMAGE = 'Alert_image';

const schema = new Schema({
  _id: String,
  name: String,
  type: String,
  size: Number,
  dimensions: String,
  class: String,
}, {
  timestamps: true,
});

export const AlertImageModel = model<AlertImageType>(ALERT_IMAGE, schema);

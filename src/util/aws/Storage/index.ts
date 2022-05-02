import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream } from 'fs';
import ValidationError from 'src/util/error/validation-error';

export class StorageService {
  private client: S3Client;

  constructor (readonly?: boolean) {
    const {
      AWS_REGION,
      AWS_ACCESS_KEY_ID_READONLY,
      AWS_SECRET_ACCESS_KEY_READONLY,
    } = process.env;

    if (!AWS_REGION || !AWS_ACCESS_KEY_ID_READONLY || !AWS_SECRET_ACCESS_KEY_READONLY) {
      throw new ValidationError('INTERNAL_ERROR_INVALID_ENV');
    }

    if (!readonly) {
      this.client = new S3Client({ region: AWS_REGION });
    } else {
      this.client = new S3Client({
        region: AWS_REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID_READONLY,
          secretAccessKey: AWS_SECRET_ACCESS_KEY_READONLY,
        },
      });
    }
  }

  async sendFile (filePath: string, fileName: string, folder: string, bucket: string): Promise<void> {
    const fileStream = createReadStream(filePath);

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: bucket,
        Key: `${folder}/${fileName}`,
        Body: fileStream,
      },
    });

    await upload.done();
  }

  async getFileUrl (bucket: string, folder: string, fileName: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: `${folder}/${fileName}`,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: 1800,
    });

    return url;
  }
}

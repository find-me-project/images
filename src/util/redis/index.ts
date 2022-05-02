import { createClient, RedisClientType } from 'redis';
import ValidationError from 'src/util/error/validation-error';

export class RedisService {
  private client: RedisClientType;

  constructor () {
    const {
      REDIS_URL,
    } = process.env;

    if (!REDIS_URL) {
      throw new ValidationError('INTERNAL_ERROR_INVALID_ENV');
    }

    this.client = createClient({
      url: REDIS_URL,
    });
  }

  async set (key: string, value: string, expiresIn: number): Promise<void> {
    await this.client.connect();

    await this.client.set(key, value, {
      EX: expiresIn,
    });

    await this.client.disconnect();
  }

  async get (key: string): Promise<string | null> {
    await this.client.connect();

    const result = await this.client.get(key);

    await this.client.disconnect();

    return result;
  }
}

import { AlertImageType } from 'src/models/AlertImage';

interface IAlertImageRepository {
  create(image: AlertImageType): Promise<void>
}

export default IAlertImageRepository;

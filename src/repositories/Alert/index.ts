import { AlertImageDimensionEnum, AlertImageType } from 'src/models/AlertImage';
import { ImageClassEnum } from 'src/util/image';

interface IAlertRepository {
  // existsByIdAndAccountId (id: string, accountId: string): Promise<boolean>,
  addImage(alertId: string, image: string): Promise<void>,
  getImage(alertId: string, dimension: AlertImageDimensionEnum, imageClass: ImageClassEnum): Promise<AlertImageType | undefined>,
}

export default IAlertRepository;

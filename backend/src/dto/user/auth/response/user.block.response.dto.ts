import { BlockStatus } from '../../../../enums/commonEnums';

export class UserBlockStatusDTO {
  id: string;
  isActive: boolean;
  status: BlockStatus;

  constructor(data: { id: string; isActive: boolean; status: BlockStatus }) {
    this.id = data.id;
    this.isActive = data.isActive;
    this.status = data.status;
  }
}

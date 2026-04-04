import { AcceptanceStatus } from '../../../../enums/commonEnums';

interface VendorLoginResponseDTOData {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isActive: boolean;
  isVerified: boolean;
  isAccepted: AcceptanceStatus;
}

export class VendorLoginResponseDTO {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isActive: boolean;
  isVerified: boolean;
  isAccepted: AcceptanceStatus;

  constructor(data: VendorLoginResponseDTOData) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.imageUrl = data.imageUrl;
    this.isActive = data.isActive;
    this.isVerified = data.isVerified;
    this.isAccepted = data.isAccepted;
  }
}

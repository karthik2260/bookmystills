import { AcceptanceStatus } from '../../../enums/commonEnums';

interface VendorProfileResponseDTOData {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  companyName: string;
  city: string;
  about: string;
  contactinfo: string;
  isActive: boolean;
  isVerified: boolean;
  isAccepted: AcceptanceStatus;
  totalRating: number;
  totalBooking: number;
  createdAt: string;
  updatedAt: string;
}

export class VendorProfileResponseDTO {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  companyName: string;
  city: string;
  about: string;
  contactinfo: string;
  isActive: boolean;
  isVerified: boolean;
  isAccepted: AcceptanceStatus;
  totalRating: number;
  totalBooking: number;
  createdAt: string;
  updatedAt: string;

  constructor(data: VendorProfileResponseDTOData) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.imageUrl = data.imageUrl;
    this.companyName = data.companyName;
    this.city = data.city;
    this.about = data.about;
    this.contactinfo = data.contactinfo;
    this.isActive = data.isActive;
    this.isVerified = data.isVerified;
    this.isAccepted = data.isAccepted;
    this.totalRating = data.totalRating;
    this.totalBooking = data.totalBooking;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

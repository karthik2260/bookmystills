export class UserProfileResponseDTO {
  id: string;
  name: string;
  email: string;
  contactinfo: string | undefined;
  imageUrl: string | undefined;
  isActive: boolean;
  isGoogleUser: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    contactinfo?: string;
    imageUrl?: string;
    isActive: boolean;
    isGoogleUser: boolean;
    createdAt: string;
    updatedAt: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.contactinfo = data.contactinfo;
    this.imageUrl = data.imageUrl;
    this.isActive = data.isActive;
    this.isGoogleUser = data.isGoogleUser;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

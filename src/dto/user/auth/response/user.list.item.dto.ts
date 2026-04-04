export class UserListItemDTO {
  id: string;
  name: string;
  email: string;
  contactinfo: string | undefined;
  imageUrl: string | undefined;
  isActive: boolean;
  isGoogleUser: boolean;
  createdAt: string;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    contactinfo?: string;
    imageUrl?: string;
    isActive: boolean;
    isGoogleUser: boolean;
    createdAt: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.contactinfo = data.contactinfo;
    this.imageUrl = data.imageUrl;
    this.isActive = data.isActive;
    this.isGoogleUser = data.isGoogleUser;
    this.createdAt = data.createdAt;
  }
}

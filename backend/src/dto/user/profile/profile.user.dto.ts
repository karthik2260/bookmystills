export class ProfileUserDTO {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  contactinfo?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
    contactinfo?: string;
    createdAt?: string;
    updatedAt?: string;
    isActive: boolean;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.imageUrl = data.imageUrl;
    this.contactinfo = data.contactinfo;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.isActive = data.isActive;
  }
}

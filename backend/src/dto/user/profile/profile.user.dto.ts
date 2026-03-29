export class ProfileUserDTO {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  contactinfo?: string;
  createdAt?: string;
  updatedAt?: string;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
    contactinfo?: string;
    createdAt?: string;
    updatedAt?: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.imageUrl = data.imageUrl;
    this.contactinfo = data.contactinfo;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
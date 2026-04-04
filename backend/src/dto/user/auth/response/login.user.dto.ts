export class LoginUserDTO {
  id: string;
  name: string;
  email: string;
  imageUrl?: string | undefined;
  isActive: boolean;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
    isActive: boolean;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.imageUrl = data.imageUrl;
    this.isActive = data.isActive;
  }
}

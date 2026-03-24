export class LoginUserDTO {
  id: string;
  name: string;
  email: string;
  imageUrl?: string | undefined;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  }) {
    this.id       = data.id;
    this.name     = data.name;
    this.email    = data.email;
    this.imageUrl = data.imageUrl;
  }
}




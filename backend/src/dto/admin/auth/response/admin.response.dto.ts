export class AdminLoginDTO {
  id: string;
  email: string;

  constructor(data: { id: string; email: string }) {
    this.id = data.id;
    this.email = data.email;
  }
}

export class AdminLoginResponseDTO {
  message: string;
  token: string;
  refreshToken: string;
  admin: AdminLoginDTO;

  constructor(data: {
    message: string;
    token: string;
    admin: AdminLoginDTO;
    refreshToken: string;
  }) {
    this.message = data.message;
    this.token = data.token;
    this.refreshToken = data.refreshToken;
    this.admin = data.admin;
  }
}

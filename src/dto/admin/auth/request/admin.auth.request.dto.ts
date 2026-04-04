export class AdminLoginRequestDTO {
  email: string;
  password: string;

  constructor(data: { email: string; password: string }) {
    this.email = data.email.trim().toLowerCase();
    this.password = data.password;
  }
}

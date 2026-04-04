export class VendorLoginRequestDTO {
  email: string;
  password: string;

  constructor(data: Partial<VendorLoginRequestDTO>) {
    this.email = data.email?.trim().toLowerCase() || '';
    this.password = data.password || '';
  }
}

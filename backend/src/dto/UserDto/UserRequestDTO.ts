export class SignupRequestDTO {
  name: string;
  email: string;
  password: string;
  contactinfo: string;

  constructor(body: any) {
    this.name = body.name;
    this.email = body.email;
    this.password = body.password;
    this.contactinfo = body.contactinfo;
  }
}

export class SignupRequestDTO {
    name: string;
    email: string;
    contactinfo: string;
    password: string;


    constructor (data: {
        name: string;
        email: string;
        contactinfo: string;
        password: string;
    }) {
        this.name = data.name.trim();
        this.email= data.email.trim();
        this.contactinfo = data.contactinfo.trim();
        this.password = data.password.trim()
    }
}
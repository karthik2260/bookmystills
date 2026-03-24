export class VerifyOtpRequestDTO {
    otp:string;

    constructor (data:{otp:string}){
        this.otp = data.otp.trim()
    }
}
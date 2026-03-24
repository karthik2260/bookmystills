export class SendOtpResponseDTO {
  message: string;
  otpExpiry: number;
  resendAvailableAt: number;

  constructor(data: {
    message: string;
    otpExpiry: number;
    resendAvailableAt: number;
  }) {
    this.message           = data.message;
    this.otpExpiry         = data.otpExpiry;
    this.resendAvailableAt = data.resendAvailableAt;
  }
}
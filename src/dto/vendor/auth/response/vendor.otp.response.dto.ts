interface VendorOtpResponseDTOData {
  email: string;
  otpExpiry: number;
  resendAvailableAt: number;
}

export class VendorOtpResponseDTO {
  email: string;
  otpExpiry: number;
  resendAvailableAt: number;

  constructor(data: VendorOtpResponseDTOData) {
    this.email = data.email;
    this.otpExpiry = data.otpExpiry;
    this.resendAvailableAt = data.resendAvailableAt;
  }
}

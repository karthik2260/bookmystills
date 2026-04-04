import {
  axiosInstance,
  axiosSessionInstanceV,
} from "@/config/api/axiosinstance";

export interface VerifyVendorOtpResult {
  message: string;
  vendor?: unknown;
}

export const verifyVendorOtpApi = async (
  otp: string,
): Promise<VerifyVendorOtpResult> => {
  const response = await axiosSessionInstanceV.post("/verify-email", { otp });
  return {
    message: response.data.message,
    vendor: response.data.vendor,
  };
};

export interface ResendVendorOtpResult {
  message: string;
  otpExpiry: number;
  resendAvailableAt: number;
}

export const resendVendorOtpApi = async (): Promise<ResendVendorOtpResult> => {
  const response = await axiosInstance.get("/resendOtp");
  return {
    message: response.data.message,
    otpExpiry: response.data.otpExpiry,
    resendAvailableAt: response.data.resendAvailableAt,
  };
};

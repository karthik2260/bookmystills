import {
  axiosInstance,
  axiosSessionInstance,
} from "@/config/api/axiosinstance";

export interface VerifyOtpResult {
  message: string;
}

export const verifyOtpApi = async (otp: string): Promise<VerifyOtpResult> => {
  const response = await axiosSessionInstance.post("/verify", { otp });
  return {
    message: response.data.message,
  };
};

export interface ResendOtpResult {
  message: string;
  otpExpiry: number;
  resendAvailableAt: number;
}

export const resendOtpApi = async (): Promise<ResendOtpResult> => {
  const response = await axiosInstance.get("/resendOtp");
  return {
    message: response.data.message,
    otpExpiry: response.data.otpExpiry,
    resendAvailableAt: response.data.resendAvailableAt,
  };
};

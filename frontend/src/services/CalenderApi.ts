import type { AxiosInstance, AxiosError } from "axios";
import axios from "axios";

import type { BookingFormData } from "@/utils/interface";

export const fetchUnavailableDatesApi = async (
  axiosInstance: AxiosInstance,
): Promise<string[]> => {
  const response = await axiosInstance.get("/dateAvailabilty");
  if (response.data.result?.bookedDates) {
    return response.data.result.bookedDates;
  }
  return [];
};

export interface UpdateAvailabilityResult {
  success: boolean;
  mode: "block" | "unblock";
  dates: string[];
}

export const updateAvailabilityApi = async (
  axiosInstance: AxiosInstance,
  mode: "block" | "unblock",
  selectedDates: string[],
): Promise<UpdateAvailabilityResult> => {
  const endpoint =
    mode === "block" ? "/dateAvailabilty" : "/dateAvailabilty/unblock";
  const response = await axiosInstance.post(endpoint, { dates: selectedDates });

  return {
    success: response.data.success,
    mode,
    dates: selectedDates,
  };
};

export interface BookingRequestPayload extends BookingFormData {
  vendorId?: string;
  startingDate?: string;
}

export const submitBookingRequestApi = async (
  axiosInstance: AxiosInstance,
  payload: BookingRequestPayload,
): Promise<boolean> => {
  const response = await axiosInstance.post("/bookings/request", payload);
  return response.data.success === true;
};

export const isAxiosErrorWithMessage = (
  error: unknown,
): error is AxiosError<{ message: string }> => {
  return axios.isAxiosError(error) && !!error.response?.data?.message;
};

import axios, { AxiosError } from 'axios';
import { axiosInstanceVendor } from '@/config/api/axiosinstance';

export interface ReapplyPayload {
  portfolioFiles: File[];
  aadharFront: File | null;
  aadharBack: File | null;
}

export const submitReapplicationApi = async (payload: ReapplyPayload): Promise<void> => {
  const formData = new FormData();

  payload.portfolioFiles.forEach((file) => {
    formData.append('portfolioImages', file);
  });

  if (payload.aadharFront) formData.append('aadharFront', payload.aadharFront);
  if (payload.aadharBack) formData.append('aadharBack', payload.aadharBack);

  const token = localStorage.getItem('vendorToken');

  await axiosInstanceVendor.post('/reapply', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const isAxiosErrorWithMessage = (
  error: unknown
): error is AxiosError<{ message: string }> => {
  return axios.isAxiosError(error) && !!error.response?.data?.message;
};
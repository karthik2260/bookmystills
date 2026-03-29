import { axiosInstance } from "@/config/api/axiosinstance";
import { ProfileUserDTO } from "@/types/userTypes";

export const getUserProfileService = async (token: string): Promise<ProfileUserDTO> => {
    const response = await axiosInstance.get('/profile', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; 
};
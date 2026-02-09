import { axiosInstance, axiosInstanceVendor } from "@/config/api/axiosinstance";
import { UserFormValues } from "@/types/userTypes";


export const loginUser = (data:{email:string;password:string}) => {
    return axiosInstance.post('/login',data)
}


export const forgotPassword = (email:string) => {
    return axiosInstance.post('/forgot-password',{email})
}

export const googleLogin = (credential: string) => {
  return axiosInstance.post('/google/login', { credential });
};


export const signupUser = (data:UserFormValues) => {
    return axiosInstance.post('/signup',data)
}

export const googleRegister = (Credential:string) => {
    return axiosInstance.post('/google/register',{Credential})
}


export const logoutUser = () => {
    return axiosInstance.post('/logout')
}


export const validateResetToken = (
  token: string,
  isVendor: boolean
) => {
  const client = isVendor ? axiosInstanceVendor : axiosInstance;
  return client.get(`/validate-reset-token/${token}`);
};


export const resetPassword = (
    token:string,
    data:{password:string; confirmPassword:string},
    isVendor:boolean
) => {
    const client = isVendor ? axiosInstanceVendor : axiosInstance;
    return client.post(`/reset-password/${token}`,data, {
        withCredentials:true,
    })
}
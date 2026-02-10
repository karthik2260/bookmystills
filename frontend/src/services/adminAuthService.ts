import { axiosInstanceAdmin } from "@/config/api/axiosinstance";


interface LoginPayload {
    email:string;
    password :string;
}


export const adminLoginService = async (payload:LoginPayload) => {
    const response = await axiosInstanceAdmin.post("/login",payload);
    return response.data
}
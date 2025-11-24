import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/user/login`,
      { email, password },
      { withCredentials: true }
    );

    return response.data;  
  } catch (error: any) {
    throw error.response?.data?.message || "Login failed";
  }
};

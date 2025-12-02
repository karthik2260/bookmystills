import { AdminLoginResponse } from "../commonInterfaces";

export interface IAdminService {
    login(email: string, password: string): Promise<AdminLoginResponse>;
    createRefreshToken(jwtTokenAdmin: string): Promise<string>;
}
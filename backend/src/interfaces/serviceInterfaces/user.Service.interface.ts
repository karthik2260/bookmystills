import { UserDocument } from "../../models/userModel"
import { User } from "../commonInterfaces"
import { BlockStatus } from "../../enums/commonEnums"
import { ILoginResponse } from "../commonInterfaces"


export interface IUserService {
    signup(email:string,password:string,name:string,contactinfo:string):Promise<User>
    login(email: string,password: string): Promise<ILoginResponse>;
    resendNewOtp(email: string): Promise<string>;
    create_RefreshToken(refreshToken: string) : Promise<string>;
     handleForgotPassword(email: string): Promise<void>;
    newPasswordChange(token: string, password: string): Promise<void>;
    validateToken (token: string): Promise<boolean>;
        passwordCheckUser(currentPassword: string, newPassword: string, userId: any): Promise<void>;



}
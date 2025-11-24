export interface UserFormValues {
    email:string;
    password:string;
    name:string;
    contactinfo:string;
    confirmPassword:string
    isGoogleUser?:boolean;
    createdAt?:string;
    updatedAt?:string
}


export interface UserData {
    _id:string;
    email:string;
    password?:string;
    name:string;
    contactinfo?:string;
}
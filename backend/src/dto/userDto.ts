export interface CreateUserDTO {
    email : string;
    name : string;
    password : string;
    contactinfo : string
}

export interface UserResponseDTO {
    id:string;
    name:string;
    email:string;
    contactinfo?:string;
    isActive:boolean;
    profilePicture?:string
    createdAt:Date
}
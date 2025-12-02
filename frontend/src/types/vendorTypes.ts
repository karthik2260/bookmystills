export interface VendorData{
    _id:string;
    email : string;
    password : string;
    name : string;
    companyName?:string;
    city : string ;
    about?:string ;
    contactinfo?: string;
    isActive:boolean;
    isVerified:boolean;
    logo:string;
    imageUrl?: string ;
    refreshToken:string;
    createdAt: string;  
    updatedAt: string;  
}

export interface VendorFormValues {
    email: string;
    password: string;
    name: string;
    city : string
    contactinfo: string;
    confirmPassword: string;
    companyName: string;
    about: string,
  }

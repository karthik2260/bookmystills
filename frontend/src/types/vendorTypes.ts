import { PostData } from "./postTypes";

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
    isAccepted:AcceptanceStatus;
    logo:string;
    imageUrl?: string ;
    totalBooking?:number;
    bookedDates:Array<string>;
    walletBalance: number;
  rejectionReason?: string;
    refreshToken:string;
    totalRating?:number; 
    postCount?:number;
    reportCount?: number;
    createdAt: string;  
    updatedAt: string;  
    portfolioImages?: string[];
    aadharImages?:string[]
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
    portfolioImages: File[]; 
    aadharImages:File[]
  }






  export interface VendorFormErrorValues {
    email: string;
    password: string;
    name: string;
    city : string
    contactinfo: string;
    confirmPassword: string;
    companyName: string;
    about: string,
    portfolioImages: string; 
    aadharImages:string
  }


export interface VendorResponse {
  vendors: (VendorData & { imageUrl: string })[];
  totalPages: number;
}


export interface IVendorDetails {
  vendor: VendorData,
  posts: PostData[],

}
    export enum AcceptanceStatus {
  Accepted = 'accepted',   
  Rejected = 'rejected',
  Pending = 'requested',
  Reapplied = 'reapplied'
}

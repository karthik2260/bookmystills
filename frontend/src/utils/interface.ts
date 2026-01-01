import { VendorData } from "@/types/vendorTypes";
import  { UserData } from "@/types/userTypes";
import { Role } from "./enums";




export interface ResetFormValues {
  password: string;
  confirmPassword: string;
}

export interface IFormValues {
  email: string;
  password: string;
};


export interface VendorProps {
  isVendor?: boolean,
  vendorDetails: VendorData | null;
};

export interface ValidationErrors {
  name: string;
  contactinfo: string;
  companyName: string;
  city: string,
  about: string,
}

export interface IUserDetails {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onSave: (data: FormData) => Promise<void>

}

export interface IProfileFormData {
  name: string;
  email: string;
  contactinfo: string;
  image?: File | string;
  isGoogleUser?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IValidationErrors {
  name: string;
  contactinfo: string;
};


export interface RevenueChartProps {
  role:Role
}
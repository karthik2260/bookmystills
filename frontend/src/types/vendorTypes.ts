import type { PostData } from "./postTypes";

export interface VendorData {
 id: string;
  name: string;
  email: string;
  imageUrl: string;
  isActive: boolean;
  isVerified: boolean;
  isAccepted: AcceptanceStatus;
  rejectionReason?: string;
}

export interface VendorFormValues {
  email: string;
  password: string;
  name: string;
  city: string;
  contactinfo: string;
  confirmPassword: string;
  companyName: string;
  about: string;
  portfolioImages: File[];
  aadharImages: File[];
}

export interface VendorFormErrorValues {
  email: string;
  password: string;
  name: string;
  city: string;
  contactinfo: string;
  confirmPassword: string;
  companyName: string;
  about: string;
  portfolioImages: string;
  aadharImages: string;
}

export interface VendorResponse {
  vendors: (VendorData & { imageUrl: string })[];
  totalPages: number;
}

export interface IVendorDetails {
  vendor: VendorData;
  posts: PostData[];
}
export enum AcceptanceStatus {
  Accepted = "accepted",
  Rejected = "rejected",
  Pending = "requested",
  Reapplied = "reapplied",
}

export interface vendorProfileData {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  companyName: string;
  city: string;
  about: string;
  contactinfo: string;
  isActive: boolean;
  isVerified: boolean;
  isAccepted: AcceptanceStatus;
  totalRating: number;
  totalBooking: number;
  createdAt: string;
  updatedAt: string;
}

import mongoose from 'mongoose';
import { PostDocument } from '../../models/postModel';
import { Vendor } from '../commonInterfaces';
import { PostStatus, ServiceProvided } from '../../enums/commonEnums';

export interface IPostService {
  displayPosts(
    limit: number,
    page: number,
  ): Promise<{
    posts: Partial<PostDocument>[];
    totalPages: number;
    total: number;
    currentPage: number;
  }>;
  singleVendorPosts(
    vendorId: string,
    page: number,
    limit: number,
  ): Promise<{
    posts: Partial<PostDocument>[];
    vendor: Vendor;
    totalPages: number;
    total: number;
    currentPage: number;
  }>;
  getVendorPosts(
    vendorId: mongoose.Types.ObjectId,
    limit: number,
    page: number,
  ): Promise<{
    posts: Partial<PostDocument>[];
    totalPages: number;
    total: number;
    currentPage: number;
  }>;
  addNewPost(
    caption: string,
    location: string,
    serviceType: ServiceProvided,
    status: PostStatus,
    files: Express.Multer.File[],
    vendorId: mongoose.Types.ObjectId,
  ): Promise<{ post: PostDocument }>;

  displayPostsAdmin(
    limit: number,
    page: number,
    search: string,
  ): Promise<{
    posts: Partial<PostDocument>[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>;
}

import { PostDocument } from '../../models/postModel';
import mongoose from 'mongoose';
import { IPostService } from '../../interfaces/serviceInterfaces/post.Service.interface';
import { IPostRepository } from '../../interfaces/repositoryInterfaces/post.repository.interface';
import { Vendor } from '../../interfaces/commonInterfaces';
import { IVendorRepository } from '../../interfaces/repositoryInterfaces/vendor.Repository.interface';
import { PostStatus, ServiceProvided } from '../../enums/commonEnums';
import { PostCreationService } from './postCreationService';
import { PostRetrievalService } from './postRetrievalService';

class PostService implements IPostService {
  private postRepository: IPostRepository;
  private vendorRepository: IVendorRepository;
  private creationService: PostCreationService;
  private retrievalService: PostRetrievalService;

  constructor(postRepository: IPostRepository, vendorRepository: IVendorRepository) {
    this.postRepository = postRepository;
    this.vendorRepository = vendorRepository;

    this.creationService = new PostCreationService(postRepository);
    this.retrievalService = new PostRetrievalService(postRepository, vendorRepository);
  }

  // Delegate to PostCreationService
  addNewPost = async (
    caption: string,
    location: string,
    serviceType: ServiceProvided,
    status: PostStatus,
    files: Express.Multer.File[],
    vendorId: mongoose.Types.ObjectId,
  ): Promise<{ post: PostDocument }> => {
    return this.creationService.addNewPost(caption, location, serviceType, status, files, vendorId);
  };

  // Delegate to PostRetrievalService
  getVendorPosts = async (
    vendorId: mongoose.Types.ObjectId,
    limit: number,
    page: number,
  ): Promise<{
    posts: Partial<PostDocument>[];
    totalPages: number;
    total: number;
    currentPage: number;
  }> => {
    return this.retrievalService.getVendorPosts(vendorId, limit, page);
  };

  displayPosts = async (
    limit: number,
    page: number,
  ): Promise<{
    posts: Partial<PostDocument>[];
    totalPages: number;
    total: number;
    currentPage: number;
  }> => {
    return this.retrievalService.displayPosts(limit, page);
  };

  singleVendorPosts = async (
    vendorId: string,
    page: number,
    limit: number,
  ): Promise<{
    posts: Partial<PostDocument>[];

    vendor: Vendor;

    totalPages: number;
    total: number;
    currentPage: number;
  }> => {
    return this.retrievalService.singleVendorPosts(vendorId, page, limit);
  };
  displayPostsAdmin = async (
    limit: number,
    page: number,
    search: string,
  ): Promise<{
    posts: Partial<PostDocument>[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> => {
    return this.retrievalService.displayPostsAdmin(limit, page, search);
  };
}

export default PostService;

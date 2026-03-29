import { Request, Response } from 'express';
import { handleError } from '../util/handleError';
import { CustomError } from '../error/customError';
import { AuthenticatedRequest } from '../types/vendorTypes';
import mongoose from 'mongoose';
import { AuthenticatedRequestt } from '../types/userType';
import { AuthRequest } from '../types/adminTypes';
import { IPostService } from '../interfaces/serviceInterfaces/post.Service.interface';
import HTTP_statusCode from '../enums/httpStatusCode';
import Messages from '../enums/errorMessages';

class PostController {
  private postService: IPostService;
  constructor(postService: IPostService) {
    this.postService = postService;
  }

  createPost = async (req: AuthenticatedRequestt, res: Response): Promise<void> => {
    try {
      const { caption, location, serviceType, status } = req.body;
      if (!req.user?._id) {
        res.status(HTTP_statusCode.BadRequest).json({ message: Messages.VENDOR_ID_MISSING });
        return;
      }

      const vendorId = new mongoose.Types.ObjectId(req.user._id);

      if (!vendorId) {
        res.status(HTTP_statusCode.BadRequest).json({ message: Messages.VENDOR_ID_MISSING });
        return;
      }
      const files = Array.isArray(req.files) ? req.files : [];

      if (!files.length) {
        res.status(HTTP_statusCode.BadRequest).json({ message: 'At least one image is required' });
        return;
      }
      const createdPost = await this.postService.addNewPost(
        caption,
        location,
        serviceType,
        status,
        files,
        vendorId,
      );
      res.status(HTTP_statusCode.OK).json(createdPost);
    } catch (error) {
      handleError(res, error, 'createPost');
    }
  };

  getPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new CustomError(Messages.VENDOR_NOT_FOUND, HTTP_statusCode.Unauthorized);
      }
      const vendorId = new mongoose.Types.ObjectId(req.user._id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 3;

      const result = await this.postService.getVendorPosts(vendorId, page, limit);

      res.status(HTTP_statusCode.OK).json({
        status: 'success',
        data: {
          posts: result.posts,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          total: result.total,
        },
      });
    } catch (error) {
      handleError(res, error, 'getPosts');
    }
  };

  getAllPostsUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new CustomError(Messages.VENDOR_NOT_FOUND, HTTP_statusCode.Unauthorized);
      }
      const userId = new mongoose.Types.ObjectId(req.user._id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 3;

      const result = await this.postService.displayPosts(limit, page);
      res.status(HTTP_statusCode.OK).json({
        status: 'success',
        data: {
          posts: result.posts,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          total: result.total,
        },
      });
    } catch (error) {
      handleError(res, error, 'getAllPostsUser');
    }
  };

  getVendorIdPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound);
      }
      const vendorId = req.params.vendorId;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 3;

      const result = await this.postService.singleVendorPosts(vendorId.toString(), page, limit);

      res.status(HTTP_statusCode.OK).json({
        status: 'success',
        data: {
          post: result.posts,
          vendor: result.vendor,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          total: result.total,
        },
      });
    } catch (error) {
      handleError(res, error, 'getVendorIdPosts');
    }
  };
}

export default PostController;

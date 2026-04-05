import { CustomError } from '../../error/customError';
import { s3Service } from '../s3Service';
import { PostDocument } from '../../models/postModel';
import mongoose from 'mongoose';
import { ImageService } from '../imageService';
import { validatePostInput } from '../../validations/postValidation';
import { IPostRepository } from '../../interfaces/repositoryInterfaces/post.repository.interface';
import { PostStatus, ServiceProvided } from '../../enums/commonEnums';
import HTTP_statusCode from '../../enums/httpStatusCode';
import logger from '../../config/logger';

export class PostCreationService {
  private imageService: ImageService;
  private postRepository: IPostRepository;

  constructor(postRepository: IPostRepository) {
    this.postRepository = postRepository;
    this.imageService = new ImageService();
  }

  addNewPost = async (
    caption: string,
    location: string,
    serviceType: ServiceProvided,
    status: PostStatus,
    files: Express.Multer.File[],
    vendorId: mongoose.Types.ObjectId,
  ): Promise<{ post: PostDocument }> => {
    try {
      const validationResult = await validatePostInput({
        caption,
        location,
        serviceType,
        status,
      });

      if (!validationResult.isValid) {
        throw new CustomError(
          `Validation failed : ${validationResult.errors?.join(', ')}`,
          HTTP_statusCode.InternalServerError,
        );
      }

      const processedImages = await Promise.all(
        files.map(async (file) => {
          try {
            await this.imageService.validateImage(file);

            const compressedBuffer = await this.imageService.compressImage(file);
            return {
              originalFile: file,
              compressedBuffer,
            };
          } catch (error) {
            logger.error(`Error processing image: ${file.originalname}`, error);
            throw new CustomError(
              `Failed to process image: ${file.originalname}`,
              HTTP_statusCode.InternalServerError,
            );
          }
        }),
      );

      const uploadUrls = await Promise.all(
        processedImages.map(async (processedImage) => {
          const compressedFile = {
            ...processedImage.originalFile,
            buffer: processedImage.compressedBuffer,
          };

          return await s3Service.uploadToS3(
            'bookmystills-karthik-gopakumar/vendor/post/',
            compressedFile,
          );
        }),
      );

      const postData = {
        caption,
        location,
        serviceType,
        status,
        imageUrl: uploadUrls,
        vendor_id: vendorId,
        createdAt: new Date(),
      };

      const createdPost = await this.postRepository.create(postData);

      return { post: createdPost };
    } catch (error) {
      logger.error('Error while creating new post', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create new post', HTTP_statusCode.InternalServerError);
    }
  };
}

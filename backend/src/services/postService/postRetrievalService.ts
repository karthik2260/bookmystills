import { CustomError } from "../../error/customError";
import { s3Service } from "../s3Service";
import { PostDocument } from "../../models/postModel";
import mongoose from "mongoose";
import { ObjectId } from 'mongodb';
import { IPostRepository } from "../../interfaces/repositoryInterfaces/post.repository.interface";
import { Vendor } from "../../interfaces/commonInterfaces";
import { IVendorRepository } from "../../interfaces/repositoryInterfaces/vendor.Repository.interface";
import HTTP_statusCode from "../../enums/httpStatusCode"; 

export class PostRetrievalService {
    private postRepository: IPostRepository;
    private vendorRepository: IVendorRepository;

    constructor(
        postRepository: IPostRepository,
        vendorRepository: IVendorRepository,
    ) {
        this.postRepository = postRepository;
        this.vendorRepository = vendorRepository;
    }

    private async processPostImages(posts: Partial<PostDocument>[]): Promise<Partial<PostDocument>[]> {
        return await Promise.all(
            posts.map(async (post) => {
                try {
                    let postObject = post;
                    if (post.imageUrl && Array.isArray(post.imageUrl)) {
                        const signedImageUrls = await Promise.all(
                            post.imageUrl.map(async (imageFileName) => {
                                try {
                                    return await s3Service.getFile(
                                        'bookmystills-karthik-gopakumar/vendor/post/',
                                        imageFileName
                                    );
                                } catch (error) {
                                    console.error(`Error getting signed URL for image ${imageFileName}:`, error);
                                    return null;
                                }
                            })
                        );

                        const validSignedUrls = signedImageUrls.filter(url => url !== null);

                        return {
                            ...postObject,
                            imageUrl: validSignedUrls,
                            vendor: post.vendor_id
                        };
                    }

                    return {
                        ...postObject,
                        vendor: post.vendor_id
                    };

                } catch (error) {
                    console.error('Error processing post:', error);
                    return post;
                }
            })
        );
    }

    getVendorPosts = async (
        vendorId: mongoose.Types.ObjectId,
        limit: number,
        page: number
    ): Promise<{
        posts: Partial<PostDocument>[];
        totalPages: number;
        total: number;
        currentPage: number;
    }> => {
        try {
            const result = await this.postRepository.getVendorPosts(vendorId, page, limit);

            const postWithSignedUrls = await Promise.all(
                result.posts.map(async (post) => {
                    try {
                        let postObject = post;
                        if (post.imageUrl && Array.isArray(post.imageUrl)) {
                            const signedImageUrls = await Promise.all(
                                post.imageUrl.map(async (imageFileName) => {
                                    try {
                                        return await s3Service.getFile(
                                            'bookmystills-karthik-gopakumar/vendor/post/',
                                            imageFileName
                                        );
                                    } catch (error) {
                                        console.error(`Error getting signed URL for image ${imageFileName}:`, error);
                                        return null;
                                    }
                                })
                            );

                            const validSignedUrls = signedImageUrls.filter(url => url !== null);

                            return {
                                ...postObject,
                                imageUrl: validSignedUrls
                            };
                        }

                        return postObject;

                    } catch (error) {
                        console.error('Error processing post:', error);
                        return post;
                    }
                })
            );

            return {
                posts: postWithSignedUrls,
                totalPages: result.totalPages,
                total: result.total,
                currentPage: result.currentPage
            };

        } catch (error) {
            console.error('Error in getVendorPosts:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to fetch vendor posts', HTTP_statusCode.InternalServerError);
        }
    };

    displayPosts = async (limit: number, page: number): Promise<{
        posts: Partial<PostDocument>[],
        totalPages: number,
        total: number,
        currentPage: number
    }> => {
        try {
            const result = await this.postRepository.getAllPosts(page, limit);

            const postWithSignedUrls = await this.processPostImages(result.posts);

            return {
                posts: postWithSignedUrls,
                totalPages: result.totalPages,
                total: result.total,
                currentPage: result.currentPage
            };
        } catch (error) {
            console.error('Error in displayPosts:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to fetch vendor posts', HTTP_statusCode.InternalServerError);
        }
    };

    singleVendorPosts = async (
        vendorId: string,
        page: number,
        limit: number
    ): Promise<{
        posts: Partial<PostDocument>[];
        vendor: Vendor;
        totalPages: number;
        total: number;
        currentPage: number;
    }> => {
        try {
            const [result, vendorDetails] = await Promise.all([
                this.postRepository.getSingleVendorPost(vendorId, page, limit),
                this.vendorRepository.getById(vendorId),
            ]);

            if (!vendorDetails) {
                throw new CustomError('Wrong VendorId', HTTP_statusCode.NotFound);
            }


            let processedVendorDetails = vendorDetails;

            const postWithSignedUrls = await this.processPostImages(result.vendorPosts);

            if (vendorDetails?.imageUrl) {
                try {
                    const imageUrl = await s3Service.getFile('bookmystills-karthik-gopakumar/vendor/photo/', vendorDetails?.imageUrl);
                    processedVendorDetails = {
                        ...vendorDetails.toObject(),
                        imageUrl: imageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL:', error);
                }
            }

            return {
                posts: postWithSignedUrls,
                
                vendor: processedVendorDetails,
                totalPages: result.totalPages,
                total: result.total,
                currentPage: result.currentPage
            };

        } catch (error) {
            console.error('Error in getting single VendorId posts:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to fetch VendorId Posts", HTTP_statusCode.InternalServerError);
        }
    };

    displayPostsAdmin = async (
        limit: number,
        page: number,
        search: string
    ): Promise<{
        posts: Array<PostDocument | Record<string, any>>;
        total: number;
        totalPages: number;
        currentPage: number;
    }> => {
        try {
            const result = await this.postRepository.getAllPostsAd(limit, page, search);

            const postWithSignedUrls = await this.processPostImages(result.posts);

            return {
                posts: postWithSignedUrls,
                totalPages: result.totalPages,
                total: result.total,
                currentPage: result.currentPage
            };
        } catch (error) {
            console.error('Error in displayPostsAdmin:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to fetch vendor posts', HTTP_statusCode.InternalServerError);
        }
    };
}
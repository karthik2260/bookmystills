import { IUserRepository } from '../../interfaces/repositoryInterfaces/user.repository.interface';
import { CustomError } from '../../error/customError';
import HTTP_statusCode from '../../enums/httpStatusCode';
import { createAccessToken ,createRefreshToken } from '../../config/jwt.config';
import { ILoginResponse } from '../../interfaces/commonInterfaces';
import { GoogleUserData } from '../../interfaces/commonInterfaces';
import { UserDocument } from '../../models/userModel';
import { s3Service } from '../s3Service';
import { UserMapper } from '../../mapper/user.mapper';
import { AuthRole } from '../../enums/commonEnums';
export class GoogleAuthService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  googleSignup = async ({email,name,googleId}:GoogleUserData): Promise<object> => {
    try {
      

      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser) {
        if (existingUser.isGoogleUser) {
          return UserMapper.toDTO(existingUser);
        } else {
          throw new CustomError(
            'Email already registered with different method',
            HTTP_statusCode.Conflict,
          );
        }
      }

      const newUser = await this.userRepository.create({
        email,
        googleId,
        name,
        isActive: true,
        isGoogleUser: true,
      });

     
      return {user:newUser}
    } catch (error) {
      console.error('Error in signup using google', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to SignIn using Google', HTTP_statusCode.InternalServerError);
    }
  };

  authenticateGoogleLogin = async (userData: GoogleUserData): Promise<ILoginResponse> => {
    try {
      const existingUser = await this.userRepository.findByEmail(userData.email);
      let user: UserDocument;
      let isNewUser = false;
      if (existingUser?.isActive === false) {
        throw new CustomError('Blocked by Admin', HTTP_statusCode.NoAccess);
      }

      if (existingUser) {
        if (!existingUser.isGoogleUser) {
          existingUser.isGoogleUser = true;
          existingUser.googleId = userData.googleId;
          if (userData.picture) existingUser.imageUrl = userData.picture;
          user = await existingUser.save();
        } else {
          user = existingUser;
        }
      } else {
        user = await this.userRepository.create({
          email: userData.email,
          name: userData.name,
          googleId: userData.googleId,
          isGoogleUser: true,
          imageUrl: userData.picture,
          isActive: true,
        });
        isNewUser = true;
      }
      let userWithSignedUrl = user.toObject();

      if (user?.imageUrl) {
        try {
          const isExternalUrl =
            user.imageUrl.startsWith('http://') || user.imageUrl.startsWith('https://');

          if (isExternalUrl) {
            userWithSignedUrl = {
              ...userWithSignedUrl,
              imageUrl: user.imageUrl, 
            };
          } else {
            const signedImageUrl = await s3Service.getFile('photo/', user.imageUrl);
            userWithSignedUrl = {
              ...userWithSignedUrl,
              imageUrl: signedImageUrl,
            };
          }
        } catch (error) {
          console.error('Error processing image URL during Google login:', error);
        }
      }

      const token = createAccessToken(user._id.toString(),AuthRole.USER);
      const refreshToken = createRefreshToken(user._id.toString());

      user.refreshToken = refreshToken;
      await user.save();


      return {
        user: userWithSignedUrl,
        isNewUser,
        token,
        refreshToken,
        message: 'Google authenticate successfull',
      };
    } catch (error) {
      console.error('Error in Google authentication:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'Failed to authenticate with Google',
        HTTP_statusCode.InternalServerError,
      );
    }
  };
}
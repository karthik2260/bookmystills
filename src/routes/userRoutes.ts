import express from 'express';
import UserRepository from '../repositories/userRepository';
import UserService from '../services/UserService/userService';
import VendorService from '../services/VendorService/VendorService';
import VendorRepository from '../repositories/vendorRepository';
import multer from 'multer';
import { AuthRole } from '../enums/commonEnums';
import { authenticateToken } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';
import UserAuthController from '../controllers/UserControllers/UserAuthController';
import UserProfileController from '../controllers/UserControllers/UserProfileController';
import PostController from '../controllers/postController';
import PostService from '../services/postService/postService';
import PostRepository from '../repositories/postRepository';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userRepository = new UserRepository();
const vendorRepository = new VendorRepository();
const postRepository = new PostRepository();
const vendorService = new VendorService(vendorRepository);
const postService = new PostService(postRepository, vendorRepository);
const userService = new UserService(userRepository);
const userAuthController = new UserAuthController(userService);
const postController = new PostController(postService);
const userProfileController = new UserProfileController(userService, vendorService);

const router = express.Router();

router.post('/login', userAuthController.Login.bind(userAuthController));
router.post('/logout', userAuthController.UserLogout.bind(userAuthController));
router.post('/signup', userAuthController.UserSignup.bind(userAuthController));
router.post('/verify', userAuthController.VerifyOTP.bind(userAuthController));
router.get('/resendOtp', userAuthController.ResendOtp.bind(userAuthController));

router.post('/refresh-token', userAuthController.create_RefreshToken.bind(userAuthController));

router.post('/forgot-password', userAuthController.forgotPassword.bind(userAuthController));
router.post(
  '/reset-password/:token',
  userAuthController.changeForgotPassword.bind(userAuthController),
);
router.get(
  '/validate-reset-token/:token',
  userAuthController.validateResetToken.bind(userAuthController),
);
router.put(
  '/change-password',
  authenticateToken,
  userAuthController.changePassword.bind(userAuthController),
);

router.post('/google/auth', userAuthController.googleAuth.bind(userAuthController));

router.get(
  '/profile',
  authenticateToken,
  authorizeRole(AuthRole.USER),
  userProfileController.getUserProfile.bind(userProfileController),
);
router.put(
  '/profile',
  upload.single('image'),
  authenticateToken,
  authorizeRole(AuthRole.USER),
  userProfileController.updateProfile.bind(userProfileController),
);

router.get(
  '/vendors',
  authenticateToken,
  authorizeRole(AuthRole.USER),
  userProfileController.getAllVendors.bind(userProfileController),
);
router.get(
  '/viewposts',
  authenticateToken,
  authorizeRole(AuthRole.USER),
  postController.getAllPostsUser.bind(postController),
);
router.get(
  '/portfolio/:vendorId',
  authenticateToken,
  authorizeRole(AuthRole.USER),
  postController.getVendorIdPosts.bind(postController),
);

export default router;

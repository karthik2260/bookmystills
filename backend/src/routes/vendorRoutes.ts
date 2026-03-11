import express from 'express';
import VendorRepository from '../repositories/vendorRepository';
import UserRepository from '../repositories/userRepository';
import UserService from '../services/UserService/userService';
import VendorService from '../services/VendorService/VendorService';
import multer from 'multer';
import { authenticateToken } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';
import { AuthRole } from '../enums/commonEnums';
import VendorAuthController from '../controllers/VendorController/VendorAuthController';
import UserAuthController from '../controllers/UserControllers/UserAuthController';
import UserProfileController from '../controllers/UserControllers/UserProfileController';
import VendorProfileController from '../controllers/VendorController/VendorProfileController';
import PostController from '../controllers/postController';
import { PostCreationService } from '../services/postService/postCreationService';
import PostService from '../services/postService/postService';
import PostRepository from '../repositories/postRepository';
import { VendorAvailabilityService } from '../services/VendorService/VendorAvailabilityService';
import VendorAvailabilityController from '../controllers/VendorController/VendorAvailabilityController';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const postRepository = new PostRepository();
const vendorRepository = new VendorRepository();
const vendorService = new VendorService(vendorRepository);
const vendorAuthController = new VendorAuthController(vendorService);
const vendorProfileController = new VendorProfileController(vendorService)
const userControllerr = new UserProfileController(userService, vendorService);
const postService = new PostService(postRepository,vendorRepository);
const postController = new PostController(postService);
const vendorAvailablilityController = new VendorAvailabilityController(vendorService)

router.post('/signup',  upload.fields([
    { name: 'portfolioImages', maxCount: 5 },
    { name: 'aadharFront',     maxCount: 1 },
    { name: 'aadharBack',      maxCount: 1 },
  ]), vendorAuthController.VendorSignUp.bind(vendorAuthController));
router.post('/login', vendorAuthController.VendorLogin.bind(vendorAuthController));
router.post('/verify-email', vendorAuthController.verifyOTP.bind(vendorAuthController));
router.post('/logout', vendorAuthController.VendorLogout.bind(vendorAuthController));
router.post('/refresh-token', vendorAuthController.CreateRefreshToken.bind(vendorAuthController));

router.post('/forgot-password', vendorAuthController.forgotPassword.bind(vendorAuthController));
router.post('/reset-password/:token', vendorAuthController.changeForgotPassword.bind(vendorAuthController));
router.get(
  '/validate-reset-token/:token',
  vendorAuthController.validateResetToken.bind(vendorAuthController),
);
router.put(
  '/change-password',
  authenticateToken,authorizeRole(AuthRole.VENDOR),
  vendorAuthController.changePassword.bind(vendorAuthController),
);

router.get(
  '/profile',
  authenticateToken,authorizeRole(AuthRole.VENDOR),
  vendorProfileController.getVendorProfile.bind(vendorProfileController),
);
router.put(
  '/profile',
  upload.single('image'),
  authenticateToken,authorizeRole(AuthRole.VENDOR),
  vendorProfileController.updateProfile.bind(vendorProfileController),
);

router.post(
  '/reapply',
  authenticateToken,
  authorizeRole(AuthRole.VENDOR),
  upload.fields([
    { name: 'portfolioImages', maxCount: 5 },
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 },
  ]),
  vendorAuthController.reapplyVendor.bind(vendorAuthController),
);

router.get('/posts',authenticateToken,authorizeRole(AuthRole.VENDOR),postController.getPosts.bind(postController))
router.post('/add-post', upload.array("images", 6), authenticateToken,authorizeRole(AuthRole.VENDOR), postController.createPost.bind(postController))
router.get('/vendorDetails',authenticateToken,authorizeRole(AuthRole.VENDOR), vendorProfileController.getVendorWithAll.bind(vendorProfileController));

router.get('/dateAvailabilty',authenticateToken,authorizeRole(AuthRole.VENDOR),vendorAvailablilityController.showUnavailableDates.bind(vendorAvailablilityController));
router.post('/dateAvailabilty',authenticateToken,authorizeRole(AuthRole.VENDOR),vendorAvailablilityController.addUnavailableDates.bind(vendorAvailablilityController));
router.post('/dateAvailabilty/unblock', authenticateToken,authorizeRole(AuthRole.VENDOR), vendorAvailablilityController.removeUnavailableDates.bind(vendorAvailablilityController));



export default router;

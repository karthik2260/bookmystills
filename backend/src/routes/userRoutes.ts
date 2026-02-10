import express from 'express';
import UserRepository from '../repositories/userRepository';
import UserService from '../services/UserService/userService';
import VendorService from '../services/VendorService/VendorService';
import VendorRepository from '../repositories/vendorRepository';
import VendorAuthController from '../controllers/VendorController/VendorAuthController';
import multer from 'multer';
import { AuthRole } from '../enums/commonEnums';
import { authenticateToken } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';
import UserAuthController from '../controllers/UserControllers/UserAuthController';
import UserProfileController from '../controllers/UserControllers/UserProfileController';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userRepository = new UserRepository();
const vendorRepository = new VendorRepository();
const vendorService = new VendorService(vendorRepository);
const userService = new UserService(userRepository);
const userAuthController = new UserAuthController(userService);
const userProfileController = new UserProfileController(userService,vendorService)
const UserControllerr = new VendorAuthController(vendorService)
const vendorController = new VendorAuthController(vendorService);

const router = express.Router();

router.post('/login', userAuthController.Login.bind(userAuthController));
router.post('/logout', userAuthController.UserLogout.bind(userAuthController));
router.post('/signup', userAuthController.UserSignup.bind(userAuthController));
router.post('/verify', userAuthController.VerifyOTP.bind(userAuthController));
router.get('/resendOtp', userAuthController.ResendOtp.bind(userAuthController));

router.post('/refresh-token', userAuthController.create_RefreshToken.bind(userAuthController));

router.post('/forgot-password', userAuthController.forgotPassword.bind(userAuthController));
router.post('/reset-password/:token', userAuthController.changeForgotPassword.bind(userAuthController));
router.get('/validate-reset-token/:token', userAuthController.validateResetToken.bind(userAuthController));
router.put(
  '/change-password',
  authenticateToken,
  userAuthController.changePassword.bind(userAuthController),
);

router.post('/google/register', userAuthController.googleSignUp.bind(userAuthController));
router.post('/google/login', userAuthController.googleAuth.bind(userAuthController));

router.get(
  '/profile',
  authenticateToken,
  authorizeRole(AuthRole.USER), 
  userProfileController.getUserProfile.bind(userProfileController)
);
router.put(
  '/profile',
  upload.single('image'),
  authenticateToken,authorizeRole(AuthRole.USER),
  userProfileController.updateProfile.bind(userProfileController),
);

export default router;

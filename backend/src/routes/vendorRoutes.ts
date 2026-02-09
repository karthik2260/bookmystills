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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const vendorRepository = new VendorRepository();
const vendorService = new VendorService(vendorRepository);
const vendorAuthController = new VendorAuthController(vendorService);
const vendorProfileController = new VendorProfileController(vendorService)
const userControllerr = new UserProfileController(userService, vendorService);

router.post('/signup', vendorAuthController.VendorSignUp.bind(vendorAuthController));
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

export default router;

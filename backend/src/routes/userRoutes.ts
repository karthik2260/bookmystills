import express from 'express';
import UserController from '../controllers/userController';
import UserRepository from '../repositories/userRepository';
import UserService from '../services/userService';
import { authenticateToken } from '../middlewares/authToken';
import VendorService from '../services/vendorService';
import VendorRepository from '../repositories/vendorRepository';
import VendorController from '../controllers/vendorController';

const userRepository = new UserRepository()
const vendorRepository = new VendorRepository()
const vendorService = new VendorService(vendorRepository)
const userService = new UserService(userRepository)
const userController = new UserController(userService,vendorService)

const vendorController =  new VendorController(vendorService)




const router = express.Router()

router.post('/login',userController.Login.bind(userController));
router.post('/logout',userController.UserLogout.bind(userController))
router.post('/signup',userController.UserSignup.bind(userController))
router.post('/verify',userController.VerifyOTP.bind(userController))
router.get('/resendOtp',userController.ResendOtp.bind(userController))

router.post('/refresh-token',userController.create_RefreshToken.bind(userController))

router.post('/forgot-password',userController.forgotPassword.bind(userController))
router.post('/reset-password/:token',userController.changeForgotPassword.bind(userController))
router.get('/validate-reset-token/:token',userController.validateResetToken.bind(userController))
router.put('/change-password',authenticateToken,userController.changePassword.bind(userController))

export default router
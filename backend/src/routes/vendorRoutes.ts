import express from 'express'
import { vendorMiddleware } from '../middlewares/vendorauthMiddleware'
import VendorRepository from '../repositories/vendorRepository'
import VendorController from '../controllers/vendorController'
import UserRepository from '../repositories/userRepository'
import UserService from '../services/userService'
import UserController from '../controllers/userController'
import VendorService from '../services/vendorService'
import { authenticateTokenVendor } from '../middlewares/vendorauthToken'
import multer from 'multer'


const storage = multer.memoryStorage();
const upload = multer({storage:storage})


const router = express.Router();

const userRepository = new UserRepository()
const userService = new UserService(userRepository)
const vendorRepository = new VendorRepository();
const vendorService = new VendorService(vendorRepository);
const vendorController =  new VendorController(vendorService);
const userController = new UserController(userService,vendorService)

router.post('/signup',vendorController.VendorSignUp.bind(vendorController)) ;
router.post('/login',vendorController.VendorLogin.bind(vendorController)) ;
router.post('/verify-email',vendorController.verifyOTP.bind(vendorController)) ;
router.post('/logout',vendorController.VendorLogout.bind(vendorController)) ;
router.post('/refresh-token',vendorController.CreateRefreshToken.bind(vendorController)) ;

router.post('/forgot-password',vendorController.forgotPassword.bind(vendorController));
router.post('/reset-password/:token',vendorController.changeForgotPassword.bind(vendorController));
router.get('/validate-reset-token/:token',vendorController.validateResetToken.bind(vendorController));
router.put('/change-password',authenticateTokenVendor,vendorController.changePassword.bind(vendorController))


router.get('/profile', authenticateTokenVendor, vendorController.getVendorProfile.bind(vendorController))
router.put('/profile', upload.single("image"), authenticateTokenVendor, vendorController.updateProfile.bind(vendorController))

export default router
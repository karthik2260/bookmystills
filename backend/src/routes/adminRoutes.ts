import express from 'express'
import { authTokenAdmin } from '../middlewares/authMiddlewareAdmin'
import AdminRepository from '../repositories/adminRepository'
import AdminService from '../services/adminService'
import AdminController from '../controllers/adminController'
import UserRepository from '../repositories/userRepository'
import UserService from '../services/userService'
import VendorRepository from '../repositories/vendorRepository'
import VendorService from '../services/vendorService'



const router = express.Router();

const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const vendorRepository = new VendorRepository();


const adminService = new AdminService(adminRepository);
const userService = new UserService(userRepository);
const vendorService = new VendorService(vendorRepository);

const adminController = new AdminController(adminService, userService, vendorService)



router.post('/login', adminController.adminLogin.bind(adminController));
router.get('/logout', adminController.adminLogout.bind(adminController));

export default router;

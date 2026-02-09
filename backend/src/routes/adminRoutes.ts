import express from 'express';
import AdminRepository from '../repositories/adminRepository';
import AdminService from '../services/adminService';
import UserService from '../services/UserService/userService';
import UserRepository from '../repositories/userRepository';
import VendorRepository from '../repositories/vendorRepository';
import VendorService from '../services/VendorService/VendorService';
import { authenticateToken } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';
import { AuthRole } from '../enums/commonEnums';
import AdminController from '../controllers/AdminController/AdminController';
import AdminAuthController from '../controllers/AdminController/AdminAuthController';
const router = express.Router();

const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const vendorRepository = new VendorRepository();

const adminService = new AdminService(adminRepository);
const userService = new UserService(userRepository);
const vendorService = new VendorService(vendorRepository);

const adminController = new AdminController(adminService, userService, vendorService);
const adminAuthController = new AdminAuthController(adminService);

router.post('/login', adminAuthController.adminLogin.bind(adminAuthController));
router.get('/logout',authenticateToken,authorizeRole(AuthRole.ADMIN), adminAuthController.adminLogout.bind(adminAuthController));
router.get('/vendors',authenticateToken, adminController.getAllVendors.bind(adminController));
router.put(
  '/vendors/:vendorId/status',
  authenticateToken,authorizeRole(AuthRole.ADMIN),
  adminController.VerifyVendor.bind(adminController),
);

router.post('/refresh-token', adminAuthController.createRefreshToken.bind(adminAuthController));

export default router;

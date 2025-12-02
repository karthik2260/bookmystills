import Admin,{ AdminDocument } from "../models/adminModel";
import User from '../models/userModel'
import Vendor from '../models/vendorModel'
import { BaseRepository } from "./baseRepository";
import { IAdminRepository } from "../interfaces/repositoryInterfaces/admin.Repository.interface";

class AdminRepository extends BaseRepository<AdminDocument> implements IAdminRepository {
  constructor() {
    super(Admin)
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return await Admin.findOne({ email });

}

}

export default AdminRepository
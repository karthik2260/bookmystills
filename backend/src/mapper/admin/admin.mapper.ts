import { AdminLoginDTO } from '../../dto/admin/auth/response/admin.response.dto';
import { AdminDocument } from '../../models/adminModel';

export class AdminMapper {
  static toLoginDTO(admin: AdminDocument): AdminLoginDTO {
    return new AdminLoginDTO({
      id: admin._id.toString(),
      email: admin.email,
    });
  }
}

export interface VendorSignUpFiles {
  portfolioImages?: Express.Multer.File[];
  aadharImages?: string[];
}

interface VendorSignUpRequestDTOData {
  email: string;
  name: string;
  password: string;
  city: string;
  contactinfo: string;
  companyName: string;
  about: string;
  files?: VendorSignUpFiles;
}

export class VendorSignUpRequestDTO {
  email: string;
  name: string;
  password: string;
  city: string;
  contactinfo: string;
  companyName: string;
  about: string;
  files?: VendorSignUpFiles;

  constructor(data: VendorSignUpRequestDTOData) {
    this.email = data.email.trim().toLowerCase();
    this.name = data.name.trim();
    this.password = data.password.trim();
    this.city = data.city.trim();
    this.contactinfo = data.contactinfo.trim();
    this.companyName = data.companyName.trim();
    this.about = data.about.trim();
    this.files = data.files;
  }
}

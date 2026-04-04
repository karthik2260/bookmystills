export interface VendorReapplyFiles {
  portfolioImages?: Express.Multer.File[];
  aadharFront?: Express.Multer.File[];
  aadharBack?: Express.Multer.File[];
}

interface VendorReapplyRequestDTOData {
  vendorId: string;
  files?: VendorReapplyFiles;
}

export class VendorReapplyRequestDTO {
  vendorId: string;
  files?: VendorReapplyFiles;

  constructor(data: VendorReapplyRequestDTOData) {
    this.vendorId = data.vendorId.trim();
    this.files = data.files;
  }
}

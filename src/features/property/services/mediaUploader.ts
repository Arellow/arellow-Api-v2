export interface UploadJob {
  filePath: string;
  propertyId: string;
  meta: {
    mediaType: 'PHOTO' | 'VIDEO' | 'TOUR_3D';
    photoType?: string;
    caption?: string;
    altText?: string;
    order?: number;
  };
}

export interface UploadedMedia {
  url: string;
  publicId: string;
  type: string;
  width?: number;
  height?: number;
  duration?: number;
  sizeInKB?: number;
  format?: string;
  caption?: string;
  altText?: string;
  order?: number;
}

export interface IMediaUploader {
  upload(files: UploadJob[]): Promise<UploadedMedia[]>;
}

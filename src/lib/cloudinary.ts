import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
}

/**
 * Uploads an image buffer directly to Cloudinary using streaming.
 */
export const uploadImage = (
  buffer: Buffer,
  folder: string,
  options: any = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `folink/${folder}`,
        resource_type: "image",
        quality: "auto",
        fetch_format: "auto",
        secure: true,
        overwrite: false,
        unique_filename: true,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as CloudinaryUploadResult);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Deletes an image from Cloudinary using its public_id.
 */
export const deleteImage = (publicId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

/**
 * Replaces an existing image on Cloudinary (deletes old and uploads new).
 */
export const replaceImage = async (
  oldPublicId: string | null,
  newBuffer: Buffer,
  folder: string,
  options: any = {}
): Promise<CloudinaryUploadResult> => {
  if (oldPublicId) {
    try {
      await deleteImage(oldPublicId);
    } catch (e) {
      console.warn("Failed to delete old image during replacement:", e);
    }
  }
  return uploadImage(newBuffer, folder, options);
};

/**
 * Generates an optimized transformed image URL using direct transformations parameters.
 */
export const getOptimizedImage = (
  publicId: string,
  width?: number,
  height?: number,
  crop = "fill"
): string => {
  const transformations: string[] = ["f_auto", "q_auto"];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);
  
  // Create transformed secure URL
  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
  });
};

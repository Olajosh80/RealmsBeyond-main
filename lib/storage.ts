'use server';

import { uploadToCloudinary } from './cloudinary';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Image upload using Cloudinary
 */
export async function uploadImage(
  file: File,
  bucket: string, // Kept for interface compatibility, used as part of folder path
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    const result = await uploadToCloudinary(file, `realms_beyond/${bucket}/${folder}`);
    return {
      url: result.url,
      path: result.public_id
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

export async function deleteImage(bucket: string, path: string): Promise<void> {
  // TODO: Implement Cloudinary delete if needed
  console.log(`Delete requested for path: ${path} in bucket: ${bucket}`);
}

export async function uploadMultipleImages(
  files: File[],
  bucket: string,
  folder?: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => uploadImage(file, bucket, folder));
  return await Promise.all(uploadPromises);
}

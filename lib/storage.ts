import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload an image file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name (e.g., 'products', 'blog')
 * @param folder - Optional folder path within the bucket
 * @returns Promise with the public URL and file path
 */
export async function uploadImage(
  file: File,
  bucket: string,
  folder?: string
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path to delete
 */
export async function deleteImage(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Upload multiple images
 * @param files - Array of files to upload
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path
 * @returns Promise with array of upload results
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: string,
  folder?: string
): Promise<UploadResult[]> {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, bucket, folder));
    return await Promise.all(uploadPromises);
  } catch (error: any) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

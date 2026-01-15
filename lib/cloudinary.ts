import 'server-only';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;

export async function uploadToCloudinary(
    file: File | Blob,
    folder: string = 'realms_beyond'
): Promise<{ url: string; public_id: string }> {
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new Error(error.message));
                        return;
                    }
                    if (!result) {
                        reject(new Error('Cloudinary upload failed: No result returned'));
                        return;
                    }
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                }
            );

            // Write buffer to stream
            // We need to convert Buffer to stream or write it directly
            uploadStream.end(buffer);
        });
    } catch (error) {
        console.error('Error preparing file for upload:', error);
        throw error;
    }
}

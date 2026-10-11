import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { UploadApiResponse } from 'cloudinary';

export function uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
                folder: 'appointment_booking_system',
                overwrite: true,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (!result) {
                    reject(new Error('Cloudinary upload failed'));
                    return;
                }
                resolve(result);
            },
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

export function deleteFromCloudinary(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
            `appointment_booking_system/${publicId}`, { resource_type: 'image'},
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (result?.result !== 'ok' && result?.result !== 'not found') {
                    reject(
                        new Error(
                            `Cloudinary deletion failed: ${result?.result}`,
                        ),
                    );
                    return;
                }
                resolve();
            },
        );
    });
}
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { BadRequestError } from '../errors/bad-request.error';
import { Request, Response, NextFunction } from 'express';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max
        files:1
    },fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG and PNG files are allowed'));
        }
    },
});

export function handleSingleUpload(fieldName: string) {
    const uploadHandler = upload.single(fieldName);
    return (req: Request, res: Response, next: NextFunction,): void => {
        uploadHandler(req, res, async (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        next(new BadRequestError('File size exceeds the 2MB limit',),);
                        return;
                    }
                    if (err.code === 'LIMIT_FILE_COUNT') {
                        next(new BadRequestError('Only one file can be uploaded',),);
                        return;
                    }
                    next(new BadRequestError(err.message));
                    return;
                }
                next(err);
                return;
            }
            if (!req.file) {
                next();
                return;
            }
            try {
                const detected = await fileTypeFromBuffer(req.file.buffer);
                if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
                    next(new BadRequestError('Uploaded file is not a valid JPG or PNG image',),);
                    return;
                }
                req.file.mimetype = detected.mime;
                next();
            } catch (error) {
                next(error);
            }
        });
    };
}
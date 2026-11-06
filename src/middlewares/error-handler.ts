import {NextFunction,Response,Request} from "express";
import {ZodError} from "zod";
import {AppError} from "../errors/app-error";
import {resolveDatabaseError} from "../utils/map/map-database-error";
import {formatZodError} from "./validaiton";

const MULTER_MESSAGES: Record<string, string> = {
    LIMIT_FILE_SIZE: 'The uploaded file is too large',
    LIMIT_FILE_COUNT: 'Too many files were uploaded',
    LIMIT_UNEXPECTED_FILE: 'An unexpected file was uploaded',
    LIMIT_PART_COUNT: 'The uploaded form contains too many parts',
    LIMIT_FIELD_KEY: 'An uploaded field name is too long',
    LIMIT_FIELD_VALUE: 'An uploaded field value is too long',
    LIMIT_FIELD_COUNT: 'Too many fields were submitted',
};

function sendError(res: Response, statusCode: number, code: string, message: string, fieldErrors?: Record<string, string>) {
    const body: Record<string, unknown> = {
        status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
        code,
        message,
    };

    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        body.fieldErrors = fieldErrors;
    }

    return res.status(statusCode).json(body);
}

export function ErrorHandler(err:any, Req:Request, res: Response, next: NextFunction) {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof AppError) {
        return sendError(res, err.statusCode, err.code, err.message, err.fieldErrors);
    }

    if (err instanceof ZodError) {
        const { message, fieldErrors } = formatZodError(err);
        return sendError(res, 400, 'VALIDATION_ERROR', message, fieldErrors);
    }

    if (err?.name === 'MulterError') {
        return sendError(
            res,
            400,
            String(err.code ?? 'UPLOAD_ERROR'),
            MULTER_MESSAGES[err.code as string] ?? 'The file upload failed',
        );
    }

    if (err?.type === 'entity.too.large') {
        return sendError(res, 413, 'PAYLOAD_TOO_LARGE', 'The request payload is too large');
    }

    if (err instanceof SyntaxError && err.message.includes('JSON')) {
        return sendError(res, 400, 'INVALID_JSON', 'The request body contains invalid JSON');
    }

    const databaseError = resolveDatabaseError(err);
    if (databaseError) {
        return sendError(res, databaseError.statusCode, databaseError.code, databaseError.message);
    }

    return sendError(
        res,
        500,
        'INTERNAL_ERROR',
        'Something went wrong on the server. Please try again later',
    );
}

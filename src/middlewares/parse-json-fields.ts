import type { NextFunction, Request, Response } from 'express';

import { BadRequestError } from '../errors/bad-request.error';

export function parseJsonFields(...fieldNames: string[]) {
    return function (req: Request, _res: Response, next: NextFunction) {
        if (req.body == null || typeof req.body !== 'object') {
            next();
            return;
        }

        for (const fieldName of fieldNames) {
            const value = req.body[fieldName];

            if (typeof value !== 'string' || value.trim() === '') {
                continue;
            }

            try {
                req.body[fieldName] = JSON.parse(value);
            } catch {
                throw new BadRequestError(`${fieldName} must be valid JSON`);
            }
        }

        next();
    };
}

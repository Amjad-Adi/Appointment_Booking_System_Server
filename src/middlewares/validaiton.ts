import {z} from "zod";
import express from "express";
import {BadRequestError} from "../errors/bad-request.error";
import {Role} from "../models/enums/roles";
import {NotFoundError} from "../errors/not-found.error";
import {} from "../utils/Request"
import { Request, Response, NextFunction } from "express";

export function formatZodError(error: z.ZodError): { message: string; fieldErrors: Record<string, string> } {
    const fieldErrors: Record<string, string> = {};

    for (const issue of error.issues) {
        const field = issue.path.length > 0 ? issue.path.map(String).join('.') : '_form';
        if (!(field in fieldErrors)) {
            fieldErrors[field] = issue.message;
        }
    }

    const firstIssue = error.issues[0];
    const firstField = firstIssue?.path.length ? firstIssue.path.map(String).join('.') : undefined;
    const message = firstIssue
        ? firstField
            ? `${firstField}: ${firstIssue.message}`
            : firstIssue.message
        : 'The request data is invalid';

    return { message, fieldErrors };
}

export function validateBody(schema:z.ZodSchema) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>{
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const { message, fieldErrors } = formatZodError(result.error);
            throw new BadRequestError(message, fieldErrors);
        }
        req.body = result.data;
        next()
    }
}

export function validateParameter(schema:z.ZodSchema,parameterName:string) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>{
        const result = schema.safeParse(req.params[parameterName]);
        if (!result.success) {
            throw new NotFoundError(
                'Resource',
                `Invalid ${parameterName} provided in the request URL`,
            );
        }
        next()
    }
}

export function validateQuery(schema: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const { message, fieldErrors } = formatZodError(result.error);
            throw new BadRequestError(`Invalid query parameters. ${message}`, fieldErrors);
        }
        req.validatedQuery = result.data as any;
        next();
    };
}

export function validateBodyByRole(roleToSchema:Partial<Record<Role,z.ZodType>>) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>{
        const schema= roleToSchema[req.user?.role as Role] as z.ZodType | undefined;
        if (!schema) {
            throw new BadRequestError('This account role is not allowed to perform this action');
        }
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const { message, fieldErrors } = formatZodError(result.error);
            throw new BadRequestError(message, fieldErrors);
        }
        req.body = result.data;
        next()
    }
}

import {z, ZodObject} from "zod";
import express from "express";
import {BadRequestError} from "../errors/bad-request.error.js";
import {Role} from "../models/enums/roles.js";
import {NotFoundError} from "../errors/not-found.error.js";
import {} from "../utils/Request.js"
import {QueryUser} from "../models/user.model.js";
import { Request, Response, NextFunction } from "express";
export function validateBody(schema:z.ZodSchema) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>{
        const result = schema.safeParse(req.body);
        if (!result.success) {
            throw new BadRequestError();
        }
        req.body = result.data;
        next()
    }
}

export function validateParameter(schema:z.ZodSchema,parameterName:string) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>{
        const result = schema.safeParse(req.params[parameterName]);
        if (!result.success) {
            throw new NotFoundError();
        }
        next()
    }
}

export function validateQuery(schema: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            throw new BadRequestError();
        }
        req.validatedQuery = result.data as any;
        next();
    };
}

export function validateBodyByRole(roleToSchema:Partial<Record<Role,z.ZodType>>) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>{
        const schema= roleToSchema[req.user.role as Role] as z.ZodType ;
        const result = schema.safeParse(req.body);
        if (!result.success) {
            throw new BadRequestError();
        }
        req.body = result.data;
        next()
    }
}

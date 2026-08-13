import {z, ZodObject} from "zod";
import express from "express";
import {BadRequestErorr} from "../errors/bad-request.erorr";
import {Role} from "../models/enums/roles";
import {ZodSchema} from "zod/v3";
import {NotFoundError} from "../errors/not-found.error";
export function validateBody(schema:z.ZodSchema) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>{
        let result = schema.safeParse(req.body);
        if (!result.success) {
            throw new BadRequestErorr();
        }
        req.body = result.data;
        next()
    }
}

export function validateParameter(schema:z.ZodSchema,parameterName:string) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>{
        let result = schema.safeParse(req.params[parameterName]);
        if (!result.success) {
            throw new NotFoundError();
        }
        next()
    }
}

export function validateBodyByRole(roleToSchema:Partial<Record<Role,z.ZodType>>) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>{
        const schema= roleToSchema[req.user.role as Role] as z.ZodType ;
        let result = schema.safeParse(req.body);
        if (!result.success) {
            throw new BadRequestErorr();
        }
        req.body = result.data;
        next()
    }
}

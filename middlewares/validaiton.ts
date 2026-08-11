import { z } from "zod";
import express from "express";
import {BadRequestErorr} from "../errors/bad-request.erorr";
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

export function validateParameter(schema:z.ZodSchema) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>{
        let result = schema.safeParse(req.params);
        if (!result.success) {
            throw new BadRequestErorr();
        }
        next()
    }
}
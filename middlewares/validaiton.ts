import { z } from "zod";
import express from "express";
import {BadRequest} from "../errors/bad-request";
export function validate(schema:z.ZodSchema) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>{
        let result = schema.safeParse(req.body);
        if (!result.success) {
            throw new BadRequest();
        }
        req.body = result.data;
        next()
    }
}
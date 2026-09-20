import {NextFunction,Response,Request} from "express";
import {AppError} from "../errors/app-error.js";

export function ErrorHandler(err:any, Req:Request, res: Response, next: NextFunction) {
    console.error(err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({status:err.status, message:err.message});
    }
    return res.status(500).json({status:"Error", message:"Internal Server Error"});
}
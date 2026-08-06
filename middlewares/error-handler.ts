import {NextFunction,Response,Request} from "express";
import {AppError} from "../errors/app-error";

export function ErrorHandler(err:any, Req:Request, res: Response, next: NextFunction) {
    console.log(err)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({status:err.status, message:err.message});
    }
    console.error(err);
    return res.status(500).json({status:"Error", message:"Internal Server Error"});
}